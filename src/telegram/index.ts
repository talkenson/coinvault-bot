import { locales } from "../locales.ts";
import type { Bot } from "grammy";
import { getBalance } from "../app/use-cases/getBalance.ts";

export default (bot: Bot) => {
  bot.command("__debug", async (ctx) => {
    await ctx.reply(
      Object.entries({
        userId: ctx.from?.id,
        chatId: ctx.chat?.id,
      })
        .map(([key, value]) => `${key} : ${value}`)
        .join("\n"),
      {
        reply_to_message_id: ctx.message?.message_id,
      },
    );
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(locales.help(), {
      reply_to_message_id: ctx.update.message?.message_id,
    });
  });

  bot.command("balance", async (ctx) => {
    const id = ctx.from?.id;
    if (!id) return;

    const balance = (await getBalance(id.toString(10))) ?? 0;

    await ctx.reply(locales.yourBalance(balance), {
      reply_to_message_id: ctx.update.message?.message_id,
      parse_mode: "HTML",
    });
  });
};
