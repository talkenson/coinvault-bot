import { Elysia } from "elysia";
import { webhookCallback } from "grammy";
import { APP_VERSION, IS_PRODUCTION } from "./constants.ts";
import { logStart } from "./src/general.ts";
import { bot } from "./src/bot.ts";
import telegramHandler from "./src/telegram";

bot.errorHandler = (error) => {
  console.error("[ERROR] Error: ", error);
};

// start Handlers for telegram and REST
telegramHandler(bot);

// end

const app = new Elysia()
  .get("/", () => "Hello from CoinVault!")
  .get("/health-check", ({ request }) => {
    return { status: true, info: "All good!" };
  })
  .get("/version", () => {
    return { version: APP_VERSION };
  });

if (IS_PRODUCTION) {
  console.log("Listening on WebHook...");
  const handleUpdate = webhookCallback(bot, "bun");

  app.post(`/${bot.token}`, async (ctx) => {
    try {
      return await handleUpdate(ctx.request);
    } catch (err) {
      console.error(err);
      return ctx.error(400, { error: JSON.stringify(err) });
    }
  });
} else {
  bot.start();
}

app.listen(3000);

logStart();
