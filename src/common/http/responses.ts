import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import {
  errorEnvelope,
  type ErrorFields,
  successEnvelope,
} from "@/common/http/envelope";

export const jsonSuccess = <T, S extends ContentfulStatusCode>(
  c: Context,
  data: T,
  status: S,
  message = "Operation successful",
) => {
  return c.json(successEnvelope(data, message), status);
};

export const jsonError = <S extends ContentfulStatusCode>(
  c: Context,
  status: S,
  message: string,
  errors?: ErrorFields,
) => {
  return c.json(errorEnvelope(message, errors), status);
};
