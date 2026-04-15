import { eq } from "drizzle-orm";

import { hashPassword } from "@/common/auth/password";
import { db, closeDatabaseConnection } from "@/db/client";
import { transactions, users } from "@/db/schema";

const DEMO_EMAIL = "demo@example.com";

const seed = async () => {
  const existingUser = await db.query.users.findFirst({
    where: (table, { eq: equals }) => equals(table.email, DEMO_EMAIL),
  });

  const passwordHash = await hashPassword("password123");

  const user =
    existingUser ??
    (
      await db
        .insert(users)
        .values({
          firstName: "Demo",
          lastName: "User",
          email: DEMO_EMAIL,
          passwordHash,
          profilePicture: null,
        })
        .returning()
    )[0];

  const existingTransaction = await db.query.transactions.findFirst({
    where: (table, { eq: equals }) => equals(table.userId, user.id),
  });

  if (!existingTransaction) {
    await db.insert(transactions).values([
      {
        userId: user.id,
        name: "Salary",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
        kind: "Income",
        amount: 5000000,
      },
      {
        userId: user.id,
        name: "Groceries",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        kind: "Expense",
        amount: 450000,
      },
      {
        userId: user.id,
        name: "Transport",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        kind: "Expense",
        amount: 120000,
      },
      {
        userId: user.id,
        name: "Freelance",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        kind: "Income",
        amount: 900000,
      },
    ]);
  }

  await db
    .update(users)
    .set({ updatedAt: new Date() })
    .where(eq(users.id, user.id));

  console.log(`Seed complete. Demo credentials: ${DEMO_EMAIL} / password123`);
};

try {
  await seed();
} finally {
  await closeDatabaseConnection();
}
