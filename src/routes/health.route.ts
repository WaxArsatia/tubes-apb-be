import { createRoute, type OpenAPIHono } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";

import { createSuccessEnvelopeSchema } from "@/common/http/envelope";

const healthDataSchema = createSuccessEnvelopeSchema(
  z.object({
    healthy: z.literal(true),
  }),
);

const healthRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      description: "Health check",
      content: {
        "application/json": {
          schema: healthDataSchema,
        },
      },
    },
  },
});

export const registerHealthRoutes = (app: OpenAPIHono) => {
  app.openapi(healthRoute, (c) => {
    return c.json(
      {
        success: true,
        message: "Service is healthy",
        data: {
          healthy: true,
        },
      },
      200,
    );
  });
};
