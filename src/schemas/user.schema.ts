import { z } from "@hono/zod-openapi";

export const UserParamsSchema = z.object({
  id: z
    .string()
    .min(1)
    .openapi({
      param: {
        name: "id",
        in: "path",
      },
      example: "123",
    }),
});

export const UserSchema = z
  .object({
    id: z.string().openapi({ example: "123" }),
    name: z.string().openapi({ example: "Ultra-man" }),
    age: z.number().openapi({ example: 20 }),
  })
  .openapi("User");

export const ErrorResponseSchema = z
  .object({
    message: z.string().openapi({
      example: "User with id 999 was not found",
    }),
  })
  .openapi("ErrorResponse");
