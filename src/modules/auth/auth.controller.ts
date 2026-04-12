import type { Context } from "hono";

import { requireAuthenticatedUserId } from "@/common/auth/auth-middleware";
import { jsonSuccess } from "@/common/http/responses";
import {
  ChangePasswordAuthRequestSchema,
  ChangePasswordForgotRequestSchema,
  ForgotPasswordRequestSchema,
  LoginRequestSchema,
  RefreshTokenRequestSchema,
  RegisterRequestSchema,
  VerifyOtpRequestSchema,
} from "@/modules/auth/auth.schema";
import { authService } from "@/modules/auth/auth.service";

export const authController = {
  async register(c: Context) {
    const payload = RegisterRequestSchema.parse(await c.req.json());
    const data = await authService.register(payload);
    return jsonSuccess(c, data, 201, "Registration successful");
  },

  async login(c: Context) {
    const payload = LoginRequestSchema.parse(await c.req.json());
    const data = await authService.login(payload);
    return jsonSuccess(c, data, 200, "Login successful");
  },

  async refreshToken(c: Context) {
    const payload = RefreshTokenRequestSchema.parse(await c.req.json());
    const data = await authService.refreshToken(payload);
    return jsonSuccess(c, data, 200, "Token refreshed");
  },

  async logout(c: Context) {
    const payload = RefreshTokenRequestSchema.parse(await c.req.json());
    const data = await authService.logout(payload);
    return jsonSuccess(c, data, 200, "Logout successful");
  },

  async me(c: Context) {
    const userId = requireAuthenticatedUserId(c);
    const data = await authService.me(userId);
    return jsonSuccess(c, data, 200, "User profile fetched");
  },

  async forgotPassword(c: Context) {
    const payload = ForgotPasswordRequestSchema.parse(await c.req.json());
    const data = await authService.forgotPassword(payload);
    return jsonSuccess(c, data, 200, "OTP sent");
  },

  async verifyOtp(c: Context) {
    const payload = VerifyOtpRequestSchema.parse(await c.req.json());
    const data = await authService.verifyOtp(payload);
    return jsonSuccess(c, data, 200, "OTP verified");
  },

  async changePasswordForgot(c: Context) {
    const payload = ChangePasswordForgotRequestSchema.parse(await c.req.json());
    const data = await authService.changePasswordForgot(payload);
    return jsonSuccess(c, data, 200, "Password changed");
  },

  async changePasswordAuthenticated(c: Context) {
    const userId = requireAuthenticatedUserId(c);
    const payload = ChangePasswordAuthRequestSchema.parse(await c.req.json());
    const data = await authService.changePasswordAuthenticated({
      userId,
      ...payload,
    });
    return jsonSuccess(c, data, 200, "Password changed");
  },
};
