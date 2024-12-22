import { type KvKey, openKv } from "@deno/kv";
import { DENOKV_HOST } from "../constants.ts";
import { serialize as encodeV8, deserialize as decodeV8 } from "v8";

export const kv = await openKv(DENOKV_HOST, { encodeV8, decodeV8 });

export const collectList = async <ReturnType extends unknown>(key: KvKey) => {
  const data: { key: KvKey; value: ReturnType }[] = [];
  const _data = kv.list<ReturnType>({ prefix: key });

  for await (const entry of _data) {
    data.push({ key: entry.key, value: entry.value });
  }

  return data;
};

if (import.meta.main) {
  console.log("Testing KV...");
  const key = ["testing", "kv", Math.random()];
  await kv.set(key, 1);
  console.log("set", JSON.stringify(key));
  const current = await kv.get(key);
  const all = await collectList(["testing", "kv"]);
  console.log(current, JSON.stringify(all, null, 2));
}
