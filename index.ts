import { webhookCallback } from "grammy";
import { CURRENT_KEY, IS_PRODUCTION } from "./constants.ts";
import { logStart } from "./src/general.ts";
import { bot } from "./src/bot.ts";
import { locales } from "./src/locales.ts";
import dice from "./src/intents/dice.ts";
import redeemCode from "./src/intents/redeemCode.ts";
import horses from "./src/intents/horses.ts";
import { getUserStateSafe } from "./src/helpers.ts";
import { kv } from "./src/kv.ts";
import type { UserState } from "./src/types.ts";

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

// init
dice(bot);
redeemCode(bot);
horses(bot);
// init end

bot.command("top", async (ctx) => {
  const users = await kv.list<UserState>({ prefix: [CURRENT_KEY] });

  const usersTop: UserState[] = [];

  for await (const user of users) {
    usersTop.push(user.value);
  }

  usersTop.sort((a, b) => b.coins - a.coins);

  const usersTopStrings = usersTop
    .slice(0, 20)
    .map((user, index) => `${index + 1}. ${user.displayName} - ${user.coins}`);

  await ctx.reply([locales.topPlayers(), ...usersTopStrings].join("\n"), {
    reply_to_message_id: ctx.update.message?.message_id,
  });
});

bot.command("balance", async (ctx) => {
  const id = ctx.from?.id;
  if (!id) return;

  const user = await getUserStateSafe(ctx);

  await ctx.reply(locales.yourBalance(user!.coins), {
    reply_to_message_id: ctx.update.message?.message_id,
    parse_mode: "HTML",
  });
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
