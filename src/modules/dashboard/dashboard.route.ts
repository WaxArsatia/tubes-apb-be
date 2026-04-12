import { createRoute, type OpenAPIHono } from "@hono/zod-openapi";

import { dashboardController } from "@/modules/dashboard/dashboard.controller";
import {
  DashboardSuccessSchema,
  ErrorEnvelopeSchema,
} from "@/modules/dashboard/dashboard.schema";

const getDashboardRoute = createRoute({
  method: "get",
  path: "/dashboard",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Dashboard summary",
      content: {
        "application/json": {
          schema: DashboardSuccessSchema,
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

export const registerDashboardRoutes = (app: OpenAPIHono) => {
  app.openapi(getDashboardRoute, (c) => dashboardController.getDashboard(c));
};
