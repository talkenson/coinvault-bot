import type { Bot, Context, SessionFlavor } from "grammy";
import type { UserData } from "../types.ts";

type SessionDataUnion<Ready extends boolean> = Ready extends true
  ? {
      ready: true;
      user: UserData;
      balance: number;
    }
  : Ready extends false
    ? {
        ready: false;
        user: undefined;
        balance: number;
      }
    : never;

export interface SessionData {
  cache: SessionDataUnion<boolean>;
  isAdmin?: boolean;
}

export type BotPatchedContext = Context & SessionFlavor<SessionData>;

export type BotType = Bot<BotPatchedContext>;
