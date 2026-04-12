import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "@/db/client";
import { passwordResetOtps, refreshTokens, users } from "@/db/schema";

type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
};

type CreateRefreshTokenInput = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

type CreatePasswordResetOtpInput = {
  userId: string;
  email: string;
  otpHash: string;
  expiresAt: Date;
};

export const authRepository = {
  findUserByEmail(email: string) {
    return db.query.users.findFirst({
      where: (table, { eq: equals }) => equals(table.email, email),
    });
  },

  findUserById(userId: string) {
    return db.query.users.findFirst({
      where: (table, { eq: equals }) => equals(table.id, userId),
    });
  },

  async createUser(input: CreateUserInput) {
    const [user] = await db.insert(users).values(input).returning();
    return user;
  },

  async createRefreshToken(input: CreateRefreshTokenInput) {
    const [refreshToken] = await db
      .insert(refreshTokens)
      .values(input)
      .returning();
    return refreshToken;
  },

  findRefreshTokenByHash(tokenHash: string) {
    return db.query.refreshTokens.findFirst({
      where: (table, { eq: equals }) => equals(table.tokenHash, tokenHash),
    });
  },

  findActiveRefreshTokenByHash(tokenHash: string) {
    return db.query.refreshTokens.findFirst({
      where: and(
        eq(refreshTokens.tokenHash, tokenHash),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date()),
      ),
    });
  },

  revokeRefreshToken(id: string, replacedByTokenId?: string) {
    return db
      .update(refreshTokens)
      .set({
        revokedAt: new Date(),
        ...(replacedByTokenId ? { replacedByTokenId } : {}),
      })
      .where(eq(refreshTokens.id, id));
  },

  revokeAllActiveRefreshTokensByUserId(userId: string) {
    return db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
      );
  },

  async createPasswordResetOtp(input: CreatePasswordResetOtpInput) {
    const [otp] = await db.insert(passwordResetOtps).values(input).returning();
    return otp;
  },

  findLatestOtpByEmail(email: string) {
    return db.query.passwordResetOtps.findFirst({
      where: (table, { eq: equals }) => equals(table.email, email),
      orderBy: (table, { desc: orderByDesc }) => [orderByDesc(table.createdAt)],
    });
  },

  markOtpVerified(otpId: string) {
    return db
      .update(passwordResetOtps)
      .set({ verifiedAt: new Date() })
      .where(eq(passwordResetOtps.id, otpId));
  },

  expireOtpNow(otpId: string) {
    return db
      .update(passwordResetOtps)
      .set({
        expiresAt: new Date(),
        verifiedAt: new Date(),
      })
      .where(eq(passwordResetOtps.id, otpId));
  },

  updateUserPassword(userId: string, passwordHash: string) {
    return db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  },
};
