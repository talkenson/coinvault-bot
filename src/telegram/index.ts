import { locales } from "../locales.ts";
import { getBalance } from "../app/use-cases/getBalance.ts";
import type { BotType } from "../session/types.ts";
import { ADMINS } from "../../constants.ts";
import { stripFirst } from "../helpers.ts";
import { kv } from "../kv.ts";
import { getUserBalancePath } from "../app/paths.ts";
import { safeParseNumber } from "../utils.ts";
import { isPrivateChat } from "./utils.ts";
import { InlineKeyboard, InlineQueryResultBuilder } from "grammy";
import { transferCommand } from "../app/lib/transferCommand.ts";

export default (bot: BotType) => {
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

  bot.command("balance", async (ctx) => {
    if (!isPrivateChat(ctx)) return;
    const id = ctx.session.cache.user?.id;
    if (!id) return;

    const cachedBalance = ctx.session.cache.balance;

    // const balance = (await getBalance(id.toString(10))) ?? 0;

    await ctx.reply(`Ваш баланс: ${cachedBalance}`, {
      reply_to_message_id: ctx.update.message?.message_id,
      parse_mode: "HTML",
    });
  });

  bot.command("me", async (ctx) => {
    if (!ctx.session.cache.ready || !ctx.message?.text) {
      return;
    }

    await ctx.reply(
      `
${ctx.session.cache.user.displayName}, адрес вашего кошелька:
\`${ctx.session.cache.user.id}\` _(нажмите для копирования)_`,
      {
        reply_to_message_id: ctx.update.message?.message_id,
        parse_mode: "Markdown",
      },
    );
  });

  bot.command("addfunds", async (ctx) => {
    if (!isPrivateChat(ctx)) return;
    if (
      !ctx.session.cache.ready ||
      !ADMINS.includes(ctx.session.cache.user.id.toString(10)) ||
      !ctx.message?.text
    ) {
      return;
    }

    const [_amount] = stripFirst(ctx.message.text).split(/\s+/);

    const safeAmount = safeParseNumber(_amount, 0);

    if (safeAmount === 0) {
      return ctx.reply("C этим я ничего сделать не могу");
    }

    await kv.set(
      getUserBalancePath(ctx.session.cache.user.id.toString(10)),
      ctx.session.cache.balance + safeAmount,
    );

    const balance = await getBalance(ctx.session.cache.user.id.toString(10));
    if (!balance) return;

    ctx.session.cache.balance = balance;

    await ctx.reply(`Баланс успешно обновлен: ${balance.toString(10)}`);
  });

  bot.command("transfer", async (ctx) => {
    // if (!isPrivateChat(ctx)) return;
    if (!ctx.session.cache.ready || !ctx.message?.text) {
      return;
    }

    const senderId = ctx.session.cache.user.id.toString(10);

    const [_recipient, _amount] = stripFirst(ctx.message.text).split(/\s+/);

    if (!_recipient || !_amount || !_recipient.length || !_amount.length)
      return ctx.reply("Используйте: /transfer <ID> <amount>");

    await transferCommand(ctx, bot, {
      recipient: _recipient,
      amount: _amount,
      sender: senderId,
    });
  });

  bot.command("send", async (ctx) => {
    // if (!isPrivateChat(ctx)) return;
    if (!ctx.session.cache.ready || !ctx.message?.text) {
      return;
    }

    if (
      !ctx.message.reply_to_message ||
      !ctx.message.reply_to_message.from?.id
    ) {
      await ctx.reply(
        "С помощью /send вы можете переводить проще\n" +
          "Но нужно обязательно ответить на сообщение получателя",
      );
      return bot.api.deleteMessage(ctx.message.chat.id, ctx.message.message_id);
    }

    const recipientId = ctx.message.reply_to_message.from.id;

    const senderId = ctx.session.cache.user.id.toString(10);

    const [amount] = stripFirst(ctx.message.text).split(/\s+/);

    await ctx.reply(
      `Sending money to ${
        recipientId
      }. Amount - ${amount}, sender - ${senderId}`,
    );

    await transferCommand(ctx, bot, {
      recipient: recipientId.toString(10),
      amount: amount,
      sender: senderId,
    });
  });

  // INLINE SECTION

  //   match: [ "best bot library", "library", index: 0, input: "best bot library", groups: undefined
  //   ],
  //   update: {
  //     update_id: 229800159,
  //     inline_query: {
  //       id: "4792636759358804384",
  //       from: [Object ...],
  //       chat_type: "private",
  //       query: "best bot library",
  //       offset: "",
  //     },
  //   },
  //   bot.inlineQuery(/best bot (framework|library)/, async (ctx) => {
  //     console.log(ctx.inlineQuery);
  //     const match = ctx.match; // объект, который подходит регулярному выражению
  //     const query = ctx.inlineQuery.query; // строка запроса
  //
  //     const result = InlineQueryResultBuilder.article(
  //       "id:grammy-website",
  //       "grammY",
  //       {
  //         reply_markup: new InlineKeyboard().url(
  //           "grammY вебсайт",
  //           "https://grammy.dev/",
  //         ),
  //       },
  //     ).text(
  //       `<b>grammY</b> это лучший способ создания собственных ботов Telegram.
  // У них даже есть симпатичный сайт! 👇`,
  //       { parse_mode: "HTML" },
  //     );
  //
  //     // Ответьте на инлайн запросы
  //     await ctx.answerInlineQuery(
  //       [result], // ответ со списком результатов
  //       { cache_time: 30 * 24 * 3600 }, // 30 дней в секундах
  //     );
  //   });

  // bot.on("inline_query", async (ctx) => {
  //   const query = ctx.inlineQuery.query; // строка запроса
  //   console.log(query);
  //
  //   const result = InlineQueryResultBuilder.article(
  //     "id:hint-transfer",
  //     "Отправить ",
  //     {
  //       reply_markup: new InlineKeyboard().url(
  //         "Перейти в CoinVault",
  //         `https://t.me/${ctx.me.username}`,
  //       ),
  //       description:
  //         "Отвечайте на сообщение с указанием бота и суммы - она будет отправлена автору",
  //     },
  //   ).text("");
  //
  //   await ctx.answerInlineQuery(
  //     [result], // ответ со списком результатов
  //   );
  // });
};
