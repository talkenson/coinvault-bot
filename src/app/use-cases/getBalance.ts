import { kv } from "../../kv.ts";
import { getUserBalancePath } from "../paths.ts";
import { isKvEntry } from "../../utils.ts";

export const getBalance = async (userId: string) => {
  return kv.get<number>(getUserBalancePath(userId)).then((state) => {
    if (isKvEntry(state)) return state.value;
    return state.value;
  });
};
