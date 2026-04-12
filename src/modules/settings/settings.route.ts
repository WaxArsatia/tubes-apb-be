import { createRoute, type OpenAPIHono } from "@hono/zod-openapi";

import { settingsController } from "@/modules/settings/settings.controller";
import {
  ErrorEnvelopeSchema,
  UpdateProfileMultipartSchema,
  UpdateProfileSuccessSchema,
} from "@/modules/settings/settings.schema";

const updateProfileRoute = createRoute({
  method: "patch",
  path: "/settings/profile",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: UpdateProfileMultipartSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Profile updated",
      content: {
        "application/json": {
          schema: UpdateProfileSuccessSchema,
        },
      },
    },
    400: {
      description: "Bad request",
      content: {
        "application/json": {
          schema: ErrorEnvelopeSchema,
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
    413: {
      description: "Payload too large",
      content: {
        "application/json": {
          schema: ErrorEnvelopeSchema,
        },
      },
    },
    415: {
      description: "Unsupported media type",
      content: {
        "application/json": {
          schema: ErrorEnvelopeSchema,
        },
      },
    },
    422: {
      description: "Validation failed",
      content: {
        "application/json": {
          schema: ErrorEnvelopeSchema,
        },
      },
    },
  },
});

export const registerSettingsRoutes = (app: OpenAPIHono) => {
  app.openapi(updateProfileRoute, (c) => settingsController.updateProfile(c));
};
