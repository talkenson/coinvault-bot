import { kv } from "../../kv.ts";
import { getUserBalancePath, getUserInfoPath } from "../paths.ts";
import type { UserData } from "../../types.ts";

export const setupNewUser = async (userData: UserData, balance = 0) => {
  const stringId = userData.id.toString(10);
  const tx = kv.atomic();

  tx.set(getUserInfoPath(stringId), userData);
  tx.set(getUserBalancePath(stringId), balance);

  return tx.commit();
};
