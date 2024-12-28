import { DateTime } from "luxon";
import type { CommandContext, Context } from "grammy";
import { kv } from "./kv.ts";

export const getCurrentDate = () => {
  return DateTime.now().setZone("UTC+7").set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
};

export { DateTime };

export const stripFirst = (str: string) => {
  if (str.split(/\s+/).length <= 1) return "";
  return str.replace(/^\S+\s+/, "").trim();
};
