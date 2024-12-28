import { Bot } from "grammy";
import { limit } from "@grammyjs/ratelimiter";
import { BOT_TOKEN } from "../constants.ts";
import type { BotPatchedContext } from "./session/types.ts";
import { setupSessions } from "./session/setupSessions.ts";

export const bot = new Bot<BotPatchedContext>(BOT_TOKEN);

// Middleware для игнорирования всех сообщений, кроме команд
bot.use(async (ctx, next) => {
  // Проверяем, является ли сообщение командой
  if (ctx.message && ctx.message.text && ctx.message.text.startsWith("/")) {
    await next(); // Пропускаем дальше, если это команда
  }
});

bot.use(
  limit({
    timeFrame: 1000,
    limit: 2,

    onLimitExceeded: async (ctx) => {
      await ctx.reply("Пожалуйста, не спамьте!");
    },

    // Note that the key should be a number in string format such as "123456789".
    keyGenerator: (ctx) => {
      return ctx.from?.id.toString();
    },
  }),
);

setupSessions(bot);
