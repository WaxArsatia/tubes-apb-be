import { z } from "@hono/zod-openapi";

import {
  createSuccessEnvelopeSchema,
  ErrorEnvelopeSchema,
} from "@/common/http/envelope";

export const TransactionKindSchema = z.enum(["Income", "Expense"]);

export const RecentTransactionSchema = z
  .object({
    name: z.string(),
    timestamp: z.iso.datetime(),
    kind: TransactionKindSchema,
    amount: z.number().int(),
  })
  .openapi("RecentTransaction");

export const DashboardDataSchema = z
  .object({
    firstName: z.string(),
    profilePicture: z.string().nullable(),
    totalBalance: z.number().int(),
    budgetRemaining: z.number().int(),
    income: z.number().int(),
    expense: z.number().int(),
    recentTransactions: z.array(RecentTransactionSchema),
  })
  .openapi("DashboardData");

export const DashboardSuccessSchema =
  createSuccessEnvelopeSchema(DashboardDataSchema).openapi("DashboardSuccess");

export { ErrorEnvelopeSchema };
