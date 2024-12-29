import { Elysia } from "elysia";
import { webhookCallback } from "grammy";
import {
  APP_VERSION,
  BOT_DOMAIN,
  BOT_TOKEN,
  IS_PRODUCTION,
} from "./constants.ts";
import { bot } from "./src/bot.ts";
import telegramHandler from "./src/telegram";
import { httpRouter } from "./src/http";
import swagger from "@elysiajs/swagger";

bot.errorHandler = (error) => {
  console.error("[ERROR] Error: ", error);
};

// Standard handlers for telegram
telegramHandler(bot);

const app = new Elysia({})
  .use(
    swagger({
      documentation: {
        info: {
          title: "CoinVault Documentation",
          version: APP_VERSION,
        },
      },
      exclude: [`/${bot.token}`],
    }),
  )
  .get("/", () => "Hello from CoinVault!", {
    detail: {
      summary: "Приветствие от CoinVault",
      description: "Возвращает приветствие от CoinVault.",
    },
  })
  .get(
    "/health-check",
    ({ request }) => {
      return { status: true, info: "All good!" };
    },
    {
      detail: {
        summary: "Проверка статуса",
        description:
          "Возвращает поле status, если оно пришло и равно true - все хорошо.",
      },
    },
  )
  .get(
    "/version",
    () => {
      return { version: APP_VERSION };
    },
    {
      detail: {
        summary: "Получить версию",
        description: "Возвращает версию приложения.",
      },
    },
  )
  // standard handlers for HTTP
  .use(httpRouter);

if (IS_PRODUCTION) {
  console.log("[ENV] + Production");
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

      fetch(
        `https://api.telegram.org/bot${bot.token}/setWebhook?url=${BOT_DOMAIN}/${bot.token}`,
      )
        .then(() => {
          console.log("Webhook settings applied to Telegram...");
        })
        .catch(() => {
          console.error("Failed to apply webhook to Telegram...");
        });
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
