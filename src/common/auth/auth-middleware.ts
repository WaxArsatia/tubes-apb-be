import type { MiddlewareHandler } from "hono";

import { unauthorized } from "@/common/errors/app-error";
import { verifyAccessToken } from "@/common/auth/jwt";

type AuthCarrier = {
  req: {
    header: (name: string) => string | undefined;
  };
  set: (key: "userId", value: string) => void;
  get: (key: "userId") => unknown;
};

const assignAuthenticatedUser = (carrier: AuthCarrier) => {
  const authorization = carrier.req.header("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw unauthorized("Missing bearer access token");
  }

  const token = authorization.slice("Bearer ".length).trim();

  try {
    const payload = verifyAccessToken(token);
    carrier.set("userId", payload.sub);
  } catch {
    throw unauthorized("Invalid or expired access token");
  }
};

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  assignAuthenticatedUser(c);

  await next();
};

type UserIdCarrier = {
  get: (key: "userId") => unknown;
};

export const getAuthenticatedUserId = (carrier: UserIdCarrier) => {
  const userId = carrier.get("userId");

  if (!userId || typeof userId !== "string") {
    throw unauthorized("Authentication context missing");
  }

  return userId;
};

export const requireAuthenticatedUserId = (carrier: AuthCarrier) => {
  assignAuthenticatedUser(carrier);
  return getAuthenticatedUserId(carrier);
};
