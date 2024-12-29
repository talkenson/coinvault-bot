import { plural, safeParseNumber } from "../../utils.ts";
import { pendingBalanceUpdatesAccounts } from "../../session/setupSessions.ts";
import { moneyFormsGiv, moneyFormsStd } from "../../locales.ts";
import { getBalance } from "../use-cases/getBalance.ts";
import { bot } from "../../bot.ts";

export interface TransferRequestPayload {
  recipient: string;
  sender: string;
  amount: number;
  app: string;
}

export const transferRequest = async (payload: TransferRequestPayload) => {
  const balance = await getBalance(payload.sender);
  const senderId = safeParseNumber(payload.sender, 0);
  pendingBalanceUpdatesAccounts.add(senderId);
  if (balance !== null) {
    await bot.api.sendMessage(
      payload.sender,
      `
✅ Вы совершили перевод!
Через приложение: ${payload.app}

${plural(payload.amount, moneyFormsGiv, true)} -> [<a href="tg://user?id=${payload.recipient}">${payload.recipient}</a>]

Остаток на балансе:
<b>${plural(balance, moneyFormsStd, true)}</b>
`,
      {
        parse_mode: "HTML",
      },
    );
  }
  const recipientId = safeParseNumber(payload.recipient, 0);
  pendingBalanceUpdatesAccounts.add(recipientId);
  bot.api.sendMessage(
    recipientId,
    `
💵 Входящий перевод!
от: <a href="tg://user?id=${payload.sender}">Отправитель</a> (${payload.sender})

<b>+${plural(payload.amount, moneyFormsStd, true)}</b>`,
    { parse_mode: "HTML" },
  );
};
