export type UserData = {
  id: number;
  displayName: string;
  username?: string;
  is_premium?: true;
  is_bot: boolean;
};

export type Transaction = {
  timestamp: number;
  sender: string;
  recipient: string;
  amount: number;
};
