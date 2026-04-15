import "dotenv/config";

const readEnv = (key: string, fallback?: string) => {
  const value = process.env[key] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const parseNumber = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parsePositiveInteger = (value: string, fallback: number) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const port = parsePositiveInteger(process.env.PORT ?? "3000", 3000);

export const env = {
  DATABASE_URL: readEnv("DATABASE_URL"),
  PORT: port,
  JWT_ACCESS_SECRET: readEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: readEnv("JWT_REFRESH_SECRET"),
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "30d",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN ?? "90d",
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT
    ? parseNumber(process.env.SMTP_PORT, 587)
    : undefined,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
  UPLOAD_DIR: process.env.UPLOAD_DIR ?? "uploads",
  PUBLIC_BASE_URL:
    process.env.PUBLIC_BASE_URL ?? `http://localhost:${String(port)}`,
  MAX_UPLOAD_SIZE_BYTES: 10 * 1024 * 1024,
  OTP_EXPIRES_MINUTES: parsePositiveInteger(
    process.env.OTP_EXPIRES_MINUTES ?? "30",
    30,
  ),
} as const;
