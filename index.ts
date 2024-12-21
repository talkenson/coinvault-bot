import { Bot, webhookCallback } from "grammy";
import { BOT_TOKEN, IS_PRODUCTION } from "./constants.ts";
import { logStart } from "./src/general.ts";

const bot = new Bot(BOT_TOKEN);

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

bot.errorHandler = (error) => {
  console.error("Error happened: ", error);
};

logStart();

if (IS_PRODUCTION) {
  console.log("Listening on WebHook...");
  const handleUpdate = webhookCallback(bot, "bun");

  Bun.serve({
    async fetch(req) {
      if (req.method === "POST") {
        const url = new URL(req.url);
        if (url.pathname.slice(1) === bot.token) {
          try {
            return await handleUpdate(req);
          } catch (err) {
            console.error(err);
          }
        }
      }
      return new Response();
    },
  });
} else {
  bot.start();
}
