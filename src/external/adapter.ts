import { type StorageAdapter } from "grammy";

// export class CoinVaultAdapter<T> implements StorageAdapter<T> {
//   constructor(
//     private cvAddress: string,
//     private cvAccessToken: string,
//   ) {}
//
//   async read(key: string): Promise<T | undefined> {
//     const data = fetch(
//       `${this.cvAddress}/read/${key}?token=${this.cvAccessToken}`,
//       {
//         method: "GET",
//       },
//     ).then((r) => r.json());
//   }
//
//   async write(key: string, value: T) {
//     await this.kv.set([...this.prefix, key], value);
//   }
//
//   async delete(key: string) {
//     await this.kv.delete([...this.prefix, key]);
//   }
// }

// EXAMPLE

// bot.use(
//   session({
//     type: "multi",
//     money: {
//       // Это также значения по умолчанию
//       storage: new CoinVaultAdapter<number>(
//         "http://localhost:7777",
//         "ACCESS_TOKEN",
//       ),
//       initial: () => undefined,
//       getSessionKey: (ctx) => ctx.from?.id.toString(),
//       prefix: "",
//     },
//     data: {
//       initial: () => ({ userId: 0, userName: "Name" }),
//       storage: new MemorySessionStorage(),
//     },
//   }),
// );
