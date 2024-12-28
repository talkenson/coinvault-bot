import type { Context } from "grammy";
import type { UserData } from "../types.ts";

export const ctxGetUser = (ctx: Context): UserData => {
  if (!ctx.from) {
    ctx.reply("Внутренняя ошибка: Context.From is missing to get user");
    throw new Error("Context.From is missing to get user");
  }
  const from = ctx.from;
  return {
    id: from.id,
    displayName: `${from.first_name}${from.last_name ? ` ${from.last_name}` : ""}`,
    username: from.username,
    is_premium: from.is_premium,
    is_bot: from.is_bot,
  };
};

export const isPrivateChat = (ctx: Context): boolean => {
  return ctx.chat?.type === "private";
};
