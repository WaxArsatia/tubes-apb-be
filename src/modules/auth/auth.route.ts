import { createRoute, type OpenAPIHono } from "@hono/zod-openapi";

import { authController } from "@/modules/auth/auth.controller";
import {
  ChangePasswordAuthRequestSchema,
  ChangePasswordForgotRequestSchema,
  ChangePasswordSuccessSchema,
  ErrorEnvelopeSchema,
  ForgotPasswordRequestSchema,
  ForgotPasswordSuccessSchema,
  LoginRequestSchema,
  LoginSuccessSchema,
  LogoutSuccessSchema,
  MeSuccessSchema,
  RefreshTokenRequestSchema,
  RegisterRequestSchema,
  RegisterSuccessSchema,
  VerifyOtpRequestSchema,
  VerifyOtpSuccessSchema,
} from "@/modules/auth/auth.schema";

const registerRoute = createRoute({
  method: "post",
  path: "/auth/register",
  request: {
    body: {
      content: {
        "application/json": {
          schema: RegisterRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: "User registered",
      content: {
        "application/json": {
          schema: RegisterSuccessSchema,
        },
      },
    },
    409: {
      description: "Email conflict",
      content: {
        "application/json": {
          schema: ErrorEnvelopeSchema,
        },
      },
    },
    422: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ErrorEnvelopeSchema,
        },
      },
    },
  },
});

const loginRoute = createRoute({
  method: "post",
  path: "/auth/login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: {
        "application/json": {
          schema: LoginSuccessSchema,
        },
      },
    },
    401: {
      description: "Invalid credentials",
      content: {
        "application/json": {
          schema: ErrorEnvelopeSchema,
        },
      },
    },
    422: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ErrorEnvelopeSchema,
        },
      },
    },
  },
});

const refreshTokenRoute = createRoute({
  method: "post",
  path: "/auth/refresh-token",
  request: {
    body: {
      content: {
        "application/json": {
          schema: RefreshTokenRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Token refreshed",
      content: {
        "application/json": {
          schema: LoginSuccessSchema,
        },
      },
    },
    401: {
      description: "Invalid refresh token",
      content: {
        "application/json": {
          schema: ErrorEnvelopeSchema,
        },
      },
    },
  },
});

const logoutRoute = createRoute({
  method: "post",
  path: "/auth/logout",
  request: {
    body: {
      content: {
        "application/json": {
          schema: RefreshTokenRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Logout successful",
      content: {
        "application/json": {
          schema: LogoutSuccessSchema,
        },
      },
    },
    401: {
      description: "Invalid refresh token",
      content: {
        "application/json": {
          schema: ErrorEnvelopeSchema,
        },
      },
    },
  },
});

const meRoute = createRoute({
  method: "get",
  path: "/auth/me",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Current user profile",
      content: {
        "application/json": {
          schema: MeSuccessSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorEnvelopeSchema,
        },
      },
    },
  },
});

const forgotPasswordRoute = createRoute({
  method: "post",
  path: "/auth/forgot-password",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ForgotPasswordRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "OTP sent",
      content: {
        "application/json": {
          schema: ForgotPasswordSuccessSchema,
        },
      },
    },
    404: {
      description: "Email not found",
      content: {
        "application/json": {
          schema: ErrorEnvelopeSchema,
        },
      },
    },
  },
});

const verifyOtpRoute = createRoute({
  method: "post",
  path: "/auth/verify-otp",
  request: {
    body: {
      content: {
        "application/json": {
          schema: VerifyOtpRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "OTP verified",
      content: {
        "application/json": {
          schema: VerifyOtpSuccessSchema,
        },
      },
    },
    401: {
      description: "Invalid OTP",
      content: {
        "application/json": {
          schema: ErrorEnvelopeSchema,
        },
      },
    },
    404: {
      description: "Email not found",
      content: {
        "application/json": {
          schema: ErrorEnvelopeSchema,
        },
      },
    },
  },
});

const changePasswordForgotRoute = createRoute({
  method: "post",
  path: "/auth/change-password",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ChangePasswordForgotRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Password changed",
      content: {
        "application/json": {
          schema: ChangePasswordSuccessSchema,
        },
      },
    },
    401: {
      description: "OTP invalid",
      content: {
        "application/json": {
          schema: ErrorEnvelopeSchema,
        },
      },
    },
    404: {
      description: "Email not found",
      content: {
        "application/json": {
          schema: ErrorEnvelopeSchema,
        },
      },
    },
    422: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ErrorEnvelopeSchema,
        },
      },
    },
  },
});

const changePasswordAuthenticatedRoute = createRoute({
  method: "patch",
  path: "/auth/change-password",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ChangePasswordAuthRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Password changed",
      content: {
        "application/json": {
          schema: ChangePasswordSuccessSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorEnvelopeSchema,
        },
      },
    },
    422: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ErrorEnvelopeSchema,
        },
      },
    },
  },
});

export const registerAuthRoutes = (app: OpenAPIHono) => {
  app.openapi(registerRoute, (c) => authController.register(c));
  app.openapi(loginRoute, (c) => authController.login(c));
  app.openapi(refreshTokenRoute, (c) => authController.refreshToken(c));
  app.openapi(logoutRoute, (c) => authController.logout(c));
  app.openapi(meRoute, (c) => authController.me(c));
  app.openapi(forgotPasswordRoute, (c) => authController.forgotPassword(c));
  app.openapi(verifyOtpRoute, (c) => authController.verifyOtp(c));
  app.openapi(changePasswordForgotRoute, (c) =>
    authController.changePasswordForgot(c),
  );
  app.openapi(changePasswordAuthenticatedRoute, (c) =>
    authController.changePasswordAuthenticated(c),
  );
};
