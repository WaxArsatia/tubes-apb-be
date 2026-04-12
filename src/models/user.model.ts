export type User = {
  id: string;
  name: string;
  age: number;
};

const usersTable: Record<string, User> = {
  "123": {
    id: "123",
    name: "Ultra-man",
    age: 20,
  },
};

export const userModel = {
  findById(id: string): User | null {
    return usersTable[id] ?? null;
  },
};
