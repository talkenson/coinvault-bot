import { Elysia } from "elysia";
import { webhookCallback } from "grammy";
import { APP_VERSION, IS_PRODUCTION } from "./constants.ts";
import { bot } from "./src/bot.ts";
import telegramHandler from "./src/telegram";
import { httpRouter } from "./src/http";
import swagger from "@elysiajs/swagger";

bot.errorHandler = (error) => {
  console.error("[ERROR] Error: ", error);
};

// start Handlers for telegram and REST
telegramHandler(bot);

// end

const app = new Elysia()
  .use(swagger())
  .get("/", () => "Hello from CoinVault!")
  .get("/health-check", ({ request }) => {
    return { status: true, info: "All good!" };
  })
  .get("/version", () => {
    return { version: APP_VERSION };
  })
  .use(httpRouter);

if (IS_PRODUCTION) {
  console.log("Production, using WebHook...");
  const handleUpdate = webhookCallback(bot, "bun");

  app
    .post(`/${bot.token}`, async (ctx) => {
      try {
        return await handleUpdate(ctx.request);
      } catch (err) {
        console.error(err);
        return ctx.error(400, { error: JSON.stringify(err) });
      }
    })
    .listen(3000, ({ hostname, port }) => {
      console.log(
        `🦊 CoinVault PRODUCTION (Elysia) is running at ${hostname}:${port}`,
      );
    });
} else {
  bot.start();
  app.listen(3000, ({ hostname, port }) => {
    console.log(
      `🦊 CoinVault DEVMODE (Elysia) is running at ${hostname}:${port}`,
    );
  });
}

console.log("Started successfully...");
