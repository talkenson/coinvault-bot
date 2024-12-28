import { type Context, type NextFunction, session } from "grammy";
import { ctxGetUser } from "../telegram/utils.ts";
import type { BotPatchedContext, BotType, SessionData } from "./types.ts";
import { getBalance } from "../app/use-cases/getBalance.ts";
import { setupNewUser } from "../app/use-cases/setupNewUser.ts";

// Хранит данные для каждого пользователя.
function getSessionKey(ctx: Context): string | undefined {
  return ctx.from?.id.toString();
}

function initial(): SessionData {
  return {
    cache: {
      ready: false,
      user: undefined,
      balance: 0,
    },
  };
}

export const pendingBalanceUpdatesAccounts = new Set<number>();

async function populateSession(
  ctx: BotPatchedContext,
  next: NextFunction,
): Promise<void> {
  if (ctx.session) {
    if (ctx.session.cache.ready) {
      const userId = ctx.session.cache.user.id;
      if (pendingBalanceUpdatesAccounts.has(userId)) {
        pendingBalanceUpdatesAccounts.delete(userId);
        const balance = await getBalance(userId.toString(10));
        if (balance !== null) {
          ctx.session.cache.balance = balance;
        }
      }
    } else {
      const userData = ctxGetUser(ctx);
      const balance = await getBalance(userData.id.toString(10));
      if (balance === null) {
        // If balance is null - user is not presented
        const ok = await setupNewUser(userData, 0).then((status) => status.ok);
        if (ok) {
          await ctx.reply(
            `
Привет, ${userData.displayName}!
Для Вас был создан кошелек, его Адрес/ID совпадает с Вашим ID в Telegram,
а ещё на него Вы можете принимать переводы!
        
Кошелек: \`${userData.id.toString(10)}\`
        
Отправьте /help, чтобы узнать больше о возможностях.
        `,
            { parse_mode: "Markdown" },
          );
          ctx.session.cache = {
            ready: true,
            user: userData,
            balance: 0,
          };
        } else {
          await ctx.reply(
            "Не удалось создать Вам кошелек, если Вы продолжите - что-то может сломаться",
          );
          await next();
        }
      } else {
        ctx.session.cache = {
          ready: true,
          user: userData,
          balance: balance,
        };
      }
    }
  }
  await next();
}

export const setupSessions = (bot: BotType) => {
  bot.use(session({ initial, getSessionKey }));
  bot.use(populateSession);
};
