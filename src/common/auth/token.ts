import { createHash, randomBytes } from "node:crypto";

const durationMultipliers: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 60 * 60 * 24,
  w: 60 * 60 * 24 * 7,
};

export const parseDurationToSeconds = (input: string) => {
  const normalized = input.trim();
  const match = normalized.match(/^(\d+)([smhdw])$/i);

  if (!match) {
    throw new Error(`Unsupported duration format: ${input}`);
  }

  const [, value, unit] = match;
  return Number(value) * durationMultipliers[unit.toLowerCase()];
};

export const hashToken = (rawToken: string) => {
  return createHash("sha256").update(rawToken).digest("hex");
};

export const generateOpaqueToken = () => {
  return randomBytes(64).toString("hex");
};

export const generateOtp = () => {
  return String(Math.floor(1000 + Math.random() * 9000));
};
