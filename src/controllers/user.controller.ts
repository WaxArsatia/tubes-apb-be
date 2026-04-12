import type { User } from "@/models/user.model";
import { userService } from "@/services/user.service";

type GetUserByIdControllerResult =
  | {
      status: 200;
      body: User;
    }
  | {
      status: 404;
      body: {
        message: string;
      };
    };

export const getUserByIdController = (
  id: string,
): GetUserByIdControllerResult => {
  const user = userService.getUserById(id);

  if (!user) {
    return {
      status: 404,
      body: {
        message: `User with id ${id} was not found`,
      },
    };
  }

  return {
    status: 200,
    body: user,
  };
};
