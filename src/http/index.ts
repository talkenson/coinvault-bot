import { Elysia, t } from "elysia";
import { getAppToken } from "../app/use-cases/getAppToken.ts";
import { getBalance } from "../app/use-cases/getBalance.ts";
import { transferFunds } from "../app/use-cases/transferFunds.ts";
import { transferRequest } from "../app/lib/transferRequest.ts";

export const httpRouter = new Elysia({ prefix: "/api/v1" })
  .get(
    "/read/:userId",
    async (ctx) => {
      const userId = ctx.params.userId;
      const { token, app } = ctx.query;
      if (!userId || !token || !app) {
        return { status: false, error: "Insufficient data provided." };
      }
      const storedToken = await getAppToken(userId, app);
      if (app !== "admin" && (!storedToken || storedToken !== token)) {
        return { status: false, error: "Forbidden: Invalid token." };
      }
      const balance = await getBalance(userId);
      if (balance === null) {
        return { status: false, error: "User not found." };
      }
      return { status: true, balance: balance };
    },
    {
      params: t.Object({
        userId: t.String({
          minLength: 1,
          description: "ID Пользователя",
        }),
      }),
      query: t.Object({
        token: t.String({
          minLength: 1,
          description: "Токен юзера для приложения",
        }),
        app: t.String({
          minLength: 1,
          description: "Имя приложения",
        }),
      }),
      response: t.Union([
        t.Object(
          {
            status: t.Const(true),
            balance: t.Number(),
          },
          {
            description: "Удачно",
          },
        ),
        t.Object(
          {
            status: t.Boolean({ default: false }),
            error: t.String(),
          },
          {
            description: "Произошла ошибка",
          },
        ),
      ]),
      detail: {
        summary: "Получить баланс юзера",
        description:
          "Возвращает баланс переданного юзера, если токен юзера для этого приложения корректный.",
      },
    },
  )
  .post(
    "/transfer/:userId/:amount",
    async (ctx) => {
      const { userId, amount } = ctx.params;
      const { token, app, from } = ctx.query;
      if (!userId.length || !token || !app || !from) {
        return { status: false, error: "Insufficient data provided." };
      }
      const storedToken = await getAppToken(from, app);
      if (app !== "admin" && (!storedToken || storedToken !== token)) {
        return { status: false, error: "Forbidden: Invalid token." };
      }
      if (userId === from) {
        return {
          status: false,
          error: "Forbidden: Transfer for your own wallet is not valid.",
        };
      }
      const status = await transferFunds(from, userId, amount);
      if (!status.ok) {
        return { status: false, error: status.error };
      }

      await transferRequest({
        sender: from,
        recipient: userId,
        amount,
        app,
      });

      return { status: true };
    },
    {
      params: t.Object({
        userId: t.String({
          minLength: 1,
          description: "ID Получателя",
        }),
        amount: t.Integer({
          minimum: 0,
          description: "Сумма, целым числом",
        }),
      }),
      query: t.Object({
        token: t.String({
          minLength: 1,
          description: "Токен юзера для приложения",
        }),
        app: t.String({
          minLength: 1,
          description: "Имя приложения",
        }),
        from: t.String({
          minLength: 1,
          description: "ID Отправителя",
        }),
      }),
      response: t.Union([
        t.Object(
          {
            status: t.Const(true),
          },
          {
            description: "Удачно",
          },
        ),
        t.Object(
          {
            status: t.Boolean({ default: false }),
            error: t.String(),
          },
          {
            description: "Произошла ошибка",
          },
        ),
      ]),
      detail: {
        summary: "Перевести средства между юзерами",
        description:
          "Возвращает баланс переданного юзера, если токен юзера для этого приложения корректный.",
      },
    },
  );
