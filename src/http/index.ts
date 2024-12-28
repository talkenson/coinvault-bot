import { Elysia, t } from "elysia";
import { getAppToken } from "../app/use-cases/getAppToken.ts";
import { getBalance } from "../app/use-cases/getBalance.ts";
import { transferFunds } from "../app/use-cases/transferFunds.ts";
import { transferCommand } from "../app/lib/transferRequest.ts";

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
        userId: t.String(),
      }),
      query: t.Object({
        token: t.String(),
        app: t.String(),
      }),
      response: t.Union([
        t.Object({
          status: t.Boolean({ default: true }),
          balance: t.Number(),
        }),
        t.Object({
          status: t.Boolean({ default: false }),
          error: t.String(),
        }),
      ]),
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
      const status = await transferFunds(from, userId, amount);
      if (!status.ok) {
        return { status: false, error: status.error };
      }

      await transferCommand({
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
        }),
        amount: t.Number({
          minimum: 0,
        }),
      }),
      query: t.Object({
        token: t.String({
          minLength: 1,
        }),
        app: t.String({
          minLength: 1,
        }),
        from: t.String({
          minLength: 1,
        }),
      }),
      response: t.Union([
        t.Object({
          status: t.Boolean({ default: true }),
        }),
        t.Object({
          status: t.Boolean({ default: false }),
          error: t.String(),
        }),
      ]),
    },
  );
