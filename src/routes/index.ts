import type { OpenAPIHono } from "@hono/zod-openapi";

import { registerHealthRoutes } from "@/routes/health.route";
import { registerUserRoutes } from "@/routes/user.route";

export const registerRoutes = (app: OpenAPIHono) => {
  registerHealthRoutes(app);
  registerUserRoutes(app);
};
