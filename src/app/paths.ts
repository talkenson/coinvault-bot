export const getUserBalancePath = (userId: string) => [
  "user",
  userId,
  "balance",
];

export const getUserInfoPath = (userId: string) => ["user", userId, "info"];

export const getUserTransactionsPath = (userId: string) => [
  "user",
  userId,
  "transactions",
];
