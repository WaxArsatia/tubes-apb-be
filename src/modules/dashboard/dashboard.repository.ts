import { desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { transactions } from "@/db/schema";

export const dashboardRepository = {
  findUserProfile(userId: string) {
    return db.query.users.findFirst({
      where: (table, { eq: equals }) => equals(table.id, userId),
      columns: {
        firstName: true,
        profilePicture: true,
      },
    });
  },

  listUserTransactions(userId: string) {
    return db
      .select({
        name: transactions.name,
        timestamp: transactions.timestamp,
        kind: transactions.kind,
        amount: transactions.amount,
      })
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.timestamp));
  },
};
