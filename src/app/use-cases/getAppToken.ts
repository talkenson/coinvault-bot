import { kv } from "../../kv.ts";
import { getUserAppTokensPath, getUserBalancePath } from "../paths.ts";
import { isKvEntry } from "../../utils.ts";

export const getAppToken = async (userId: string, appId: string) => {
  return kv.get<string>(getUserAppTokensPath(userId, appId)).then((state) => {
    if (isKvEntry(state)) return state.value;
    return state.value;
  });
};
