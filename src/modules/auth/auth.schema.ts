import { z } from "@hono/zod-openapi";

import { env } from "@/common/config/env";
import {
  createSuccessEnvelopeSchema,
  ErrorEnvelopeSchema,
} from "@/common/http/envelope";

export const RegisterRequestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
  confirmationPassword: z.string().min(8),
});

export const RegisterDataSchema = z
  .object({
    registered: z.literal(true),
  })
  .openapi("AuthRegisterData");

export const RegisterSuccessSchema = createSuccessEnvelopeSchema(
  RegisterDataSchema,
).openapi("AuthRegisterSuccess");

export const LoginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const TokenBundleSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
    tokenType: z.literal("Bearer"),
    expiresIn: z.number().int(),
  })
  .openapi("TokenBundle");

export const LoginSuccessSchema =
  createSuccessEnvelopeSchema(TokenBundleSchema).openapi("AuthLoginSuccess");

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const LogoutSuccessSchema = createSuccessEnvelopeSchema(
  z
    .object({
      loggedOut: z.literal(true),
    })
    .openapi("AuthLogoutData"),
).openapi("AuthLogoutSuccess");

export const MeDataSchema = z
  .object({
    id: z.uuid(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    profilePicture: z.string().nullable(),
  })
  .openapi("AuthMeData");

export const MeSuccessSchema =
  createSuccessEnvelopeSchema(MeDataSchema).openapi("AuthMeSuccess");

export const ForgotPasswordRequestSchema = z.object({
  email: z.email(),
});

export const ForgotPasswordSuccessSchema = createSuccessEnvelopeSchema(
  z
    .object({
      email: z.email(),
      otpExpiresInMinutes: z.literal(env.OTP_EXPIRES_MINUTES),
    })
    .openapi("ForgotPasswordData"),
).openapi("ForgotPasswordSuccess");

export const VerifyOtpRequestSchema = z.object({
  email: z.email(),
  otp: z.number().int().min(1000).max(9999),
});

export const VerifyOtpSuccessSchema = createSuccessEnvelopeSchema(
  z
    .object({
      email: z.email(),
      otpVerified: z.literal(true),
    })
    .openapi("VerifyOtpData"),
).openapi("VerifyOtpSuccess");

export const ChangePasswordForgotRequestSchema = z.object({
  email: z.email(),
  otp: z.number().int().min(1000).max(9999),
  newPassword: z.string().min(8),
  confirmationPassword: z.string().min(8),
});

export const ChangePasswordAuthRequestSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmationPassword: z.string().min(8),
});

export const ChangePasswordSuccessSchema = createSuccessEnvelopeSchema(
  z
    .object({
      passwordChanged: z.literal(true),
    })
    .openapi("ChangePasswordData"),
).openapi("ChangePasswordSuccess");

export { ErrorEnvelopeSchema };
