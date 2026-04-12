import { userModel, type User } from "@/models/user.model";

export const userService = {
  getUserById(id: string): User | null {
    return userModel.findById(id);
  },
};
