import * as nodemailer from "nodemailer";

import {
  getAccessTokenExpiresInSeconds,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/common/auth/jwt";
import { hashPassword, verifyPassword } from "@/common/auth/password";
import {
  generateOtp,
  hashToken,
  parseDurationToSeconds,
} from "@/common/auth/token";
import { env } from "@/common/config/env";
import {
  conflict,
  notFound,
  unauthorized,
  unprocessableEntity,
} from "@/common/errors/app-error";
import { authRepository } from "@/modules/auth/auth.repository";

type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmationPassword: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type RefreshTokenInput = {
  refreshToken: string;
};

type ForgotPasswordInput = {
  email: string;
};

type VerifyOtpInput = {
  email: string;
  otp: number;
};

type ChangePasswordForgotInput = {
  email: string;
  otp: number;
  newPassword: string;
  confirmationPassword: string;
};

type ChangePasswordAuthInput = {
  userId: string;
  oldPassword: string;
  newPassword: string;
  confirmationPassword: string;
};

const refreshTokenLifetimeSeconds = parseDurationToSeconds(
  env.REFRESH_TOKEN_EXPIRES_IN,
);

const smtpEnabled =
  Boolean(env.SMTP_HOST) &&
  Boolean(env.SMTP_PORT) &&
  Boolean(env.SMTP_USER) &&
  Boolean(env.SMTP_PASS) &&
  Boolean(env.SMTP_FROM);

const transporter = smtpEnabled
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
  : null;

const assertPasswordConfirmation = (
  password: string,
  confirmationPassword: string,
) => {
  if (password !== confirmationPassword) {
    throw unprocessableEntity("Validation failed", {
      confirmationPassword: ["Password confirmation does not match"],
    });
  }

  if (password.length < 8) {
    throw unprocessableEntity("Validation failed", {
      password: ["Password must be at least 8 characters"],
    });
  }
};

const sendOtpEmail = async (email: string, otp: string) => {
  if (!transporter || !env.SMTP_FROM) {
    // Keep forgot-password usable in local development when SMTP is unavailable.
    console.warn(`SMTP not configured. OTP for ${email}: ${otp}`);
    return;
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: "Your password reset OTP",
    text: `Your OTP code is ${otp}. It is valid for ${String(env.OTP_EXPIRES_MINUTES)} minutes.`,
  });
};

const createTokenBundle = async (userId: string) => {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  const refreshTokenHash = hashToken(refreshToken);

  await authRepository.createRefreshToken({
    userId,
    tokenHash: refreshTokenHash,
    expiresAt: new Date(Date.now() + refreshTokenLifetimeSeconds * 1000),
  });

  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer" as const,
    expiresIn: getAccessTokenExpiresInSeconds(),
  };
};

type ValidateOtpOptions = {
  requireUnverified?: boolean;
};

const validateOtp = async (
  email: string,
  otp: number,
  options?: ValidateOtpOptions,
) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw notFound("Email not registered");
  }

  const otpRecord = await authRepository.findLatestOtpByEmail(email);

  if (!otpRecord) {
    throw unauthorized("Invalid or expired OTP");
  }

  if (otpRecord.expiresAt.getTime() <= Date.now()) {
    throw unauthorized("Invalid or expired OTP");
  }

  if (options?.requireUnverified && otpRecord.verifiedAt) {
    throw unauthorized("OTP already consumed");
  }

  const otpHash = hashToken(String(otp));

  if (otpHash !== otpRecord.otpHash) {
    throw unauthorized("Invalid or expired OTP");
  }

  return {
    user,
    otpRecord,
  };
};

export const authService = {
  async register(input: RegisterInput) {
    assertPasswordConfirmation(input.password, input.confirmationPassword);

    const existingUser = await authRepository.findUserByEmail(input.email);

    if (existingUser) {
      throw conflict("Email already registered", {
        email: ["Email already registered"],
      });
    }

    const passwordHash = await hashPassword(input.password);

    await authRepository.createUser({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
    });

    return { registered: true as const };
  },

  async login(input: LoginInput) {
    const user = await authRepository.findUserByEmail(input.email);

    if (!user) {
      throw unauthorized("Invalid credentials");
    }

    const passwordMatches = await verifyPassword(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw unauthorized("Invalid credentials");
    }

    return createTokenBundle(user.id);
  },

  async refreshToken(input: RefreshTokenInput) {
    try {
      verifyRefreshToken(input.refreshToken);
    } catch {
      throw unauthorized("Invalid or expired refresh token");
    }

    const tokenHash = hashToken(input.refreshToken);
    const tokenRecord =
      await authRepository.findActiveRefreshTokenByHash(tokenHash);

    if (!tokenRecord) {
      throw unauthorized("Invalid or expired refresh token");
    }

    const newBundle = await createTokenBundle(tokenRecord.userId);
    const replacementTokenHash = hashToken(newBundle.refreshToken);
    const replacementRecord =
      await authRepository.findRefreshTokenByHash(replacementTokenHash);

    await authRepository.revokeRefreshToken(
      tokenRecord.id,
      replacementRecord?.id,
    );

    return newBundle;
  },

  async logout(input: RefreshTokenInput) {
    try {
      verifyRefreshToken(input.refreshToken);
    } catch {
      throw unauthorized("Invalid refresh token");
    }

    const tokenHash = hashToken(input.refreshToken);
    const tokenRecord =
      await authRepository.findActiveRefreshTokenByHash(tokenHash);

    if (!tokenRecord) {
      throw unauthorized("Invalid refresh token");
    }

    await authRepository.revokeRefreshToken(tokenRecord.id);

    return { loggedOut: true as const };
  },

  async me(userId: string) {
    const user = await authRepository.findUserById(userId);

    if (!user) {
      throw unauthorized("User does not exist");
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePicture: user.profilePicture,
    };
  },

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await authRepository.findUserByEmail(input.email);

    if (!user) {
      throw notFound("Email not registered");
    }

    const otp = generateOtp();
    const otpHash = hashToken(otp);

    await authRepository.createPasswordResetOtp({
      userId: user.id,
      email: user.email,
      otpHash,
      expiresAt: new Date(Date.now() + env.OTP_EXPIRES_MINUTES * 60 * 1000),
    });

    await sendOtpEmail(user.email, otp);

    return {
      email: user.email,
      otpExpiresInMinutes: 30 as const,
    };
  },

  async verifyOtp(input: VerifyOtpInput) {
    const { otpRecord } = await validateOtp(input.email, input.otp, {
      requireUnverified: true,
    });

    await authRepository.markOtpVerified(otpRecord.id);

    return {
      email: input.email,
      otpVerified: true as const,
    };
  },

  async changePasswordForgot(input: ChangePasswordForgotInput) {
    assertPasswordConfirmation(input.newPassword, input.confirmationPassword);

    const { user, otpRecord } = await validateOtp(input.email, input.otp);

    const newPasswordHash = await hashPassword(input.newPassword);

    await authRepository.updateUserPassword(user.id, newPasswordHash);
    await authRepository.expireOtpNow(otpRecord.id);
    await authRepository.revokeAllActiveRefreshTokensByUserId(user.id);

    return {
      passwordChanged: true as const,
    };
  },

  async changePasswordAuthenticated(input: ChangePasswordAuthInput) {
    assertPasswordConfirmation(input.newPassword, input.confirmationPassword);

    const user = await authRepository.findUserById(input.userId);

    if (!user) {
      throw unauthorized("User does not exist");
    }

    const oldPasswordMatches = await verifyPassword(
      input.oldPassword,
      user.passwordHash,
    );

    if (!oldPasswordMatches) {
      throw unauthorized("Old password is invalid");
    }

    const newPasswordHash = await hashPassword(input.newPassword);

    await authRepository.updateUserPassword(user.id, newPasswordHash);
    await authRepository.revokeAllActiveRefreshTokensByUserId(user.id);

    return {
      passwordChanged: true as const,
    };
  },
};
