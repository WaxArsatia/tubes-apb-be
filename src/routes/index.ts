import type { OpenAPIHono } from "@hono/zod-openapi";

import { registerAuthRoutes } from "@/modules/auth/auth.route";
import { registerDashboardRoutes } from "@/modules/dashboard/dashboard.route";
import { registerSettingsRoutes } from "@/modules/settings/settings.route";
import { registerHealthRoutes } from "@/routes/health.route";

export const registerRoutes = (app: OpenAPIHono) => {
  registerHealthRoutes(app);
  registerAuthRoutes(app);
  registerDashboardRoutes(app);
  registerSettingsRoutes(app);
};
