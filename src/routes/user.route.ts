import { type OpenAPIHono, createRoute } from "@hono/zod-openapi";

import { getUserByIdController } from "@/controllers/user.controller";
import {
  ErrorResponseSchema,
  UserParamsSchema,
  UserSchema,
} from "@/schemas/user.schema";

export const getUserRoute = createRoute({
  method: "get",
  path: "/users/{id}",
  request: {
    params: UserParamsSchema,
  },
  responses: {
    200: {
      description: "Retrieve the user",
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
    },
    404: {
      description: "User was not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const registerUserRoutes = (app: OpenAPIHono) => {
  app.openapi(getUserRoute, (c) => {
    const { id } = c.req.valid("param");
    const result = getUserByIdController(id);

    if (result.status === 404) {
      return c.json(result.body, 404);
    }

    return c.json(result.body, 200);
  });
};
