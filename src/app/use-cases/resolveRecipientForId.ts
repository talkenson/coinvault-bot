import { bot } from "../../bot.ts";

export const resolveRecipientForId = async (idOrUsername: string) => {
  if (!idOrUsername.length) {
    return idOrUsername;
  }
  if (idOrUsername.startsWith("@")) {
    const userName = idOrUsername.slice(1);
    const chat = await bot.api.getChat(userName);
    return chat.id.toString(10);
  } else {
    return idOrUsername;
  }
};
