import type { CommandContext } from "grammy";
import type { BotPatchedContext, BotType } from "../../session/types.ts";
import { plural, safeParseAmount, safeParseNumber } from "../../utils.ts";
import { transferFunds } from "../use-cases/transferFunds.ts";
import { pendingBalanceUpdatesAccounts } from "../../session/setupSessions.ts";
import { moneyFormsStd } from "../../locales.ts";
import { getBalance } from "../use-cases/getBalance.ts";

export interface TransferCommandPayload {
  recipient: string;
  sender: string;
  amount: string;
}

export const transferCommand = async (
  ctx: CommandContext<BotPatchedContext>,
  bot: BotType,
  payload: TransferCommandPayload,
) => {
  if (!ctx.session.cache.ready || !ctx.message?.text) {
    return;
  }

  const safeAmount = safeParseAmount(payload.amount, 0);

  if (safeAmount <= 0) {
    return ctx.reply("C этим я ничего сделать не могу");
  }

  if (payload.sender === payload.recipient) {
    return ctx.reply(
      "Нельзя переводить деньги со своего кошелька на свой кошелек",
    );
  }

  const oldMsg = await ctx.reply("Пытаюсь перевести...");

  const isSuccess = await transferFunds(
    payload.sender,
    payload.recipient,
    safeAmount,
  ).then((result) => {
    if (!result.ok) {
      let resultingText = "";
      switch (result.error) {
        case "INSUFFICIENT_FUNDS":
          resultingText = "❌ К сожалению, у Вас не хватает денег.";
          break;
        case "SENDER_ACCOUNT_NOT_FOUND":
          resultingText = "❌ Ошибка перевода, сообщите администраторам.";
          break;
        case "RECIPIENT_ACCOUNT_NOT_FOUND":
          resultingText = "❌ Аккаунт получателя не найден!";
          break;
      }

      bot.api.editMessageText(ctx.chatId, oldMsg.message_id, resultingText);
      return false;
    }
    bot.api.editMessageText(
      ctx.chatId,
      oldMsg.message_id,
      "✅ Перевод успешен!",
    );
    const recipientId = safeParseNumber(payload.recipient, 0);
    if (recipientId === 0) {
      bot.api.sendMessage(
        ctx.chatId,
        "Уведомить получателя не получится, напишите ему, если это необходимо",
      );
    } else {
      pendingBalanceUpdatesAccounts.add(recipientId);
      bot.api.sendMessage(
        recipientId,
        `
💵 Входящий перевод!
от: <a href="tg://user?id=${payload.sender}">${
          ctx.session.cache.user?.username
            ? `@${ctx.session.cache.user.username}`
            : payload.sender
        }</a> (${payload.sender})

<b>+${plural(safeAmount, moneyFormsStd, true)}</b>`,
        { parse_mode: "HTML" },
      );
    }
    return true;
  });

  if (isSuccess) {
    const balance = await getBalance(ctx.session.cache.user.id.toString(10));
    if (balance === null) return;

    ctx.session.cache.balance = balance;

    await ctx.reply(
      `
Остаток на балансе:
<b>${plural(balance, moneyFormsStd, true)}</b>
`,
      {
        parse_mode: "HTML",
      },
    );
  }
};
