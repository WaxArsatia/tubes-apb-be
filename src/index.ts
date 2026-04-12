import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";

import { registerRoutes } from "@/routes";

const app = new OpenAPIHono();

registerRoutes(app);

app.doc("/doc", {
  openapi: "3.1.0",
  info: {
    title: "tubes-apb-be API",
    version: "1.0.0",
  },
});

app.get("/ui", swaggerUI({ url: "/doc" }));

export default app;
