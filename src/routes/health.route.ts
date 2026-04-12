import type { OpenAPIHono } from "@hono/zod-openapi";

export const registerHealthRoutes = (app: OpenAPIHono) => {
  app.get("/", (c) => c.text("Hello Hono + Zod OpenAPI!"));
};
