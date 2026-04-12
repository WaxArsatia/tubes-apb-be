import { z } from "@hono/zod-openapi";

export type ErrorFields = Record<string, string[]>;

export const ErrorFieldsSchema = z
  .record(z.string(), z.array(z.string()))
  .openapi("ErrorFields");

export const ErrorEnvelopeSchema = z
  .object({
    success: z.literal(false),
    message: z.string(),
    errors: ErrorFieldsSchema.optional(),
  })
  .openapi("ErrorEnvelope");

export const createSuccessEnvelopeSchema = <T extends z.ZodType>(
  dataSchema: T,
) => {
  return z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  });
};

export const successEnvelope = <T>(
  data: T,
  message = "Operation successful",
) => {
  return {
    success: true as const,
    message,
    data,
  };
};

export const errorEnvelope = (message: string, errors?: ErrorFields) => {
  return {
    success: false as const,
    message,
    ...(errors ? { errors } : {}),
  };
};
