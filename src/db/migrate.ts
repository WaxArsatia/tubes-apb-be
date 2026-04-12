import { migrate } from "drizzle-orm/postgres-js/migrator";

import { db, closeDatabaseConnection } from "@/db/client";

const isAlreadyExistsMigrationError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const knownCodes = new Set(["42P06", "42P07", "42710"]);
  const maybeError = error as {
    message?: string;
    cause?: {
      code?: string;
      message?: string;
    };
  };

  if (maybeError.cause?.code && knownCodes.has(maybeError.cause.code)) {
    return true;
  }

  return Boolean(maybeError.message?.includes("already exists"));
};

try {
  try {
    await migrate(db, {
      migrationsFolder: "./drizzle",
    });

    console.log("Migrations applied successfully");
  } catch (error) {
    if (isAlreadyExistsMigrationError(error)) {
      console.warn(
        "Migration objects already exist, skipping duplicate create statements.",
      );
    } else {
      throw error;
    }
  }
} finally {
  await closeDatabaseConnection();
}
