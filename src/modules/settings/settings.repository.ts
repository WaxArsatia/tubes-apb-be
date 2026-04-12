import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { users } from "@/db/schema";

type UpdateProfileInput = {
  userId: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
};

export const settingsRepository = {
  async updateProfile(
    input: UpdateProfileInput,
  ): Promise<{ updatedAt: Date } | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...(input.firstName !== undefined
          ? { firstName: input.firstName }
          : {}),
        ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
        ...(input.profilePicture !== undefined
          ? { profilePicture: input.profilePicture }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, input.userId))
      .returning({
        updatedAt: users.updatedAt,
      });

    return updatedUser;
  },
};
