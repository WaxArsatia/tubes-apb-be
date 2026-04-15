import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";

import { env } from "@/common/config/env";
import { errorHandler } from "@/common/errors/error-handler";
import { errorEnvelope } from "@/common/http/envelope";
import { registerRoutes } from "@/routes";

const issuesToFieldErrors = (
  issues: Array<{
    path: PropertyKey[];
    message: string;
  }>,
) => {
  const fields: Record<string, string[]> = {};

  for (const issue of issues) {
    const key =
      issue.path.length > 0 ? issue.path.map(String).join(".") : "_form";
    fields[key] ??= [];
    fields[key].push(issue.message);
  }

  return fields;
};

const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      const errors = issuesToFieldErrors(result.error.issues);

      return c.json(errorEnvelope("Validation failed", errors), 422);
    }
  },
});

const SWAGGER_ACCESS_TOKEN_STORAGE_KEY = "swagger_access_token";
const apiBaseUrl = env.PUBLIC_BASE_URL.replace(/\/+$/, "");

const swaggerRequestInterceptor = `
(request) => {
  try {
    const token = window.localStorage.getItem("${SWAGGER_ACCESS_TOKEN_STORAGE_KEY}");

    if (token) {
      request.headers = request.headers || {};

      if (!request.headers.Authorization) {
        request.headers.Authorization = "Bearer " + token;
      }
    }
  } catch (_error) {
    // no-op
  }

  return request;
}
`;

const swaggerResponseInterceptor = `
(response) => {
  try {
    const url = typeof response.url === "string" ? response.url : "";
    const isAuthTokenResponse =
      url.endsWith("/auth/login") || url.endsWith("/auth/refresh-token");

    if (!isAuthTokenResponse) {
      return response;
    }

    const candidate = response.body ?? response.data ?? response.obj;
    let payload = candidate;

    if (typeof candidate === "string") {
      payload = JSON.parse(candidate);
    }

    const token =
      payload &&
      typeof payload === "object" &&
      payload.data &&
      typeof payload.data === "object" &&
      typeof payload.data.accessToken === "string"
        ? payload.data.accessToken
        : null;

    if (token) {
      window.localStorage.setItem("${SWAGGER_ACCESS_TOKEN_STORAGE_KEY}", token);

      if (window.ui && typeof window.ui.preauthorizeApiKey === "function") {
        window.ui.preauthorizeApiKey("bearerAuth", token);
      }
    }
  } catch (_error) {
    // no-op
  }

  return response;
}
`;

const swaggerOnComplete = `
() => {
  try {
    const token = window.localStorage.getItem("${SWAGGER_ACCESS_TOKEN_STORAGE_KEY}");

    if (token && window.ui && typeof window.ui.preauthorizeApiKey === "function") {
      window.ui.preauthorizeApiKey("bearerAuth", token);
    }
  } catch (_error) {
    // no-op
  }
}
`;

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);
app.use("*", errorHandler);
app.use(`/${env.UPLOAD_DIR}/*`, serveStatic({ root: "./" }));

registerRoutes(app);

app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

app.doc("/doc", {
  openapi: "3.1.0",
  info: {
    title: "tubes-apb-be API",
    version: "1.0.0",
  },
  servers: [
    {
      url: apiBaseUrl,
    },
  ],
});

app.get(
  "/ui",
  swaggerUI({
    url: `${apiBaseUrl}/doc`,
    persistAuthorization: true,
    requestInterceptor: swaggerRequestInterceptor,
    responseInterceptor: swaggerResponseInterceptor,
    onComplete: swaggerOnComplete,
  }),
);

export default app;
