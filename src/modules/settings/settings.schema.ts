import { z } from "@hono/zod-openapi";

import {
  createSuccessEnvelopeSchema,
  ErrorEnvelopeSchema,
} from "@/common/http/envelope";

export const UpdateProfileMultipartSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profilePicture: z.any().optional().openapi({
    type: "string",
    format: "binary",
  }),
});

export const UpdateProfileSuccessSchema = createSuccessEnvelopeSchema(
  z
    .object({
      updated: z.literal(true),
      updatedAt: z.iso.datetime(),
    })
    .openapi("SettingsUpdateProfileData"),
).openapi("SettingsUpdateProfileSuccess");

export { ErrorEnvelopeSchema };
