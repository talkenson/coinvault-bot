import { getRandomFromArray, getSafeNumber, plural } from "./utils.ts";

export const locales = {
  attemptsLimit(limit: number) {
    const pluralizedLimit = plural(limit, ["ставку", "ставки", "ставок"]);
    const pluralizedTimes = plural(limit, ["раз", "раза", "раз"]);

    // "You have reached your attempts limit for today. Try again tomorrow!"
    return (
      getRandomFromArray([
        `Лимит ставок на сегодня исчерпан (${limit} ${pluralizedLimit}). Попробуй завтра! 🤑`,
        `Сегодня ты уже сделал ${limit} ${pluralizedLimit}. Попробуй завтра! 🤑`,
        `Я понимаю, что золотая лихорадка в самом разгаре, но ты уже поставил ${limit} ${pluralizedTimes} сегодня. Попробуй завтра! 🤑`,
      ]) +
      "\n<i>Не забывай, что обновление происходит в полночь по Гринвичу (МСК-3)</i>"
    );
  },

  notEnoughCoins(coins: number) {
    return `${getRandomFromArray([
      "А ты думал, что я тебе деньги дам? 😂",
      "Кажется, у кого-то закончились монеты. 😢",
    ])} \nКрутить барабан стоит ${coins} монет.`;
  },

  win(wonCoins: number, lostCoins: number) {
    const targetCoins = wonCoins - lostCoins;
    const pluralizedWonCoins = plural(targetCoins, [
      "монету",
      "монеты",
      "монет",
    ]);

    return getRandomFromArray([
      `Поздравляю, ты выиграл <i>${wonCoins} - ${lostCoins} (ставка) = <b>${targetCoins} ${pluralizedWonCoins}</b></i>! 🎉 Наслаждайся своей удачей и продолжай играть, чтобы еще больше увеличить свой капитал!`,
      `Ого, ты сегодня и правда везунчик! Твой выигрыш составил <i>${wonCoins} - ${lostCoins} (ставка) = <b>${targetCoins} ${pluralizedWonCoins}</b></i>! 💰 Поздравляю с впечатляющим результатом! Наслаждайся игрой и не забывай, что завтра тебе всегда доступно еще больше возможностей!`,
      `Лед тронулся! Ты сорвал куш в размере <i>${wonCoins} - ${lostCoins} (ставка) = <b>${targetCoins} ${pluralizedWonCoins}</b></i>! 💸 Поздравляю с великолепным выигрышем! Теперь у тебя много вариантов, как потратить свои новые сокровища!`,
      `Господи, удача на тебе улыбается! 😃 Ты выиграл <i>${wonCoins} - ${lostCoins} (ставка) = <b>${targetCoins} ${pluralizedWonCoins}</b></i> и сделал свой день ярче! Продолжай в том же духе и получай еще больше радости от игры!`,
    ]);
  },

  lose(lostAmount: number, compensation: number) {
    const pluralizedLostAmount = plural(
      lostAmount - compensation,
      ["монету", "монеты", "монет"],
      true,
    );

    return getRandomFromArray([
      `Ай-ай-ай, сегодня удача не на твоей стороне! Ты потерял <i>${lostAmount} - ${compensation} (компенсация) = <b>${pluralizedLostAmount}</b></i> 💸 Не унывай, в следующий раз обязательно повезет!`,
      `Ой-ой, кажется, сегодня тебе не суждено было победить. Твой банковский баланс стал на <i>${lostAmount} - ${compensation} (компенсация) = <b>${pluralizedLostAmount}</b></i> меньше 🙇‍♂️ Но не расстраивайся, у тебя всегда есть возможность вернуться и сорвать большой куш!`,
      `Упс, казино победило сегодня. Ты потерял <i>${lostAmount} - ${compensation} (компенсация) = <b>${pluralizedLostAmount}</b></i> в этой игре. Не отчаивайся, следующий расклад обязательно будет в твою пользу!`,
    ]);
  },

  gasReminder(gasAmount: number) {
    const pluralizedCoins = plural(
      gasAmount,
      ["монету", "монеты", "монет"],
      true,
    );

    return `<i>Кстати, за эту операцию сняли еще ${pluralizedCoins}</i>`;
  },

  yourBalance(coins: number) {
    const pluralizedCoins = plural(coins, ["монета", "монеты", "монет"], true);

    return `Ваш баланс: <b>${pluralizedCoins}</b>`;
  },

  stakesCreated(stakesCount: number) {
    if (stakesCount === 0) {
      return "<b>Пока не было ни одной ставки</b>";
    }

    const pluralizedCount = plural(
      stakesCount,
      ["ставка", "ставки", "ставок"],
      true,
    );

    return `<b>На следующий забег стоит ${pluralizedCount}</b>`;
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
