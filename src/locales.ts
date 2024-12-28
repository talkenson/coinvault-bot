import { plural } from "./utils.ts";

export const moneyFormsStd = ["монета", "монеты", "монет"];
export const moneyFormsGiv = ["монету", "монеты", "монет"];
export const moneyFormsSubj = ["монете", "монетах", "монетах"];

export const locales = {
  yourBalance(coins: number) {
    const pluralizedCoins = plural(coins, moneyFormsStd, true);

    return `Ваш баланс: <b>${pluralizedCoins}</b>`;
  },

  help() {
    return [
      "Привет! \nЯ бот Куня, приятно познакомиться!",
      "Я управляю в телеграме кошельком CoinVault",
      "",
      "Вот список команд который тебе пригодится:",
    ].join("\n");
  },
};
