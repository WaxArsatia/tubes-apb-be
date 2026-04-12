import * as jwt from "jsonwebtoken";
import { type JwtPayload } from "jsonwebtoken";

import { env } from "@/common/config/env";
import { parseDurationToSeconds } from "@/common/auth/token";
import { randomUUID } from "node:crypto";

export type AccessJwtPayload = JwtPayload & {
  sub: string;
  tokenType: "access";
};

export type RefreshJwtPayload = JwtPayload & {
  sub: string;
  tokenType: "refresh";
};

const assertPayload = (
  payload: string | JwtPayload,
  tokenType: "access" | "refresh",
): JwtPayload => {
  if (typeof payload === "string") {
    throw new Error("Invalid JWT payload");
  }

  if (payload.tokenType !== tokenType || !payload.sub) {
    throw new Error("Invalid JWT token type");
  }

  return payload;
};

export const getAccessTokenExpiresInSeconds = () => {
  return parseDurationToSeconds(env.ACCESS_TOKEN_EXPIRES_IN);
};

export const signAccessToken = (userId: string) => {
  const expiresIn = env.ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"];

  return jwt.sign({ tokenType: "access" }, env.JWT_ACCESS_SECRET, {
    subject: userId,
    expiresIn,
  });
};

export const signRefreshToken = (userId: string) => {
  const expiresIn =
    env.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"];

  // Include a unique JWT ID so refresh tokens never collide when issued in the same second.
  return jwt.sign(
    { tokenType: "refresh", jti: randomUUID() },
    env.JWT_REFRESH_SECRET,
    {
      subject: userId,
      expiresIn,
    },
  );
};

export const verifyAccessToken = (token: string) => {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
  return assertPayload(payload, "access") as AccessJwtPayload;
};

export const verifyRefreshToken = (token: string) => {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
  return assertPayload(payload, "refresh") as RefreshJwtPayload;
};
