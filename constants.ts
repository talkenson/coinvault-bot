export const IS_PRODUCTION = Bun.env.IS_PRODUCTION === "true";

export const BOT_TOKEN = (() => {
  const token = Bun.env.BOT_TOKEN;
  if (!token || token.length === 0) {
    console.error("No bot token found");
    process.exit(1);
  }
  return token;
})();
