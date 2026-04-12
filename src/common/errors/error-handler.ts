import type { MiddlewareHandler } from "hono";
import { ZodError } from "zod";

import { AppError } from "@/common/errors/app-error";
import { errorEnvelope } from "@/common/http/envelope";

const zodIssuesToFieldErrors = (error: ZodError) => {
  const fields: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key =
      issue.path.length > 0 ? issue.path.map(String).join(".") : "_form";
    fields[key] ??= [];
    fields[key].push(issue.message);
  }

  return fields;
};

export const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next();
  } catch (error) {
    if (error instanceof AppError) {
      return c.json(
        errorEnvelope(error.message, error.errors),
        error.status as 400,
      );
    }

    if (error instanceof ZodError) {
      const fields = zodIssuesToFieldErrors(error);
      return c.json(errorEnvelope("Validation failed", fields), 422);
    }

    console.error(error);
    return c.json(errorEnvelope("Internal server error"), 500);
  }
};
