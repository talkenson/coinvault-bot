import { getUserBalancePath } from "../paths.ts";
import { kv } from "../../kv.ts";

export async function transferFunds(
  sender: string,
  recipient: string,
  amount: number,
) {
  if (amount <= 0)
    return {
      ok: false,
      error: "INSUFFICIENT_FUNDS" as const,
    };

  const senderKey = getUserBalancePath(sender);
  const recipientKey = getUserBalancePath(recipient);

  // Retry the transaction until it succeeds.
  const res = { ok: false };
  while (!res.ok) {
    // Read the current balance of both accounts.
    const [senderRes, receiverRes] = await kv.getMany<[number, number]>([
      senderKey,
      recipientKey,
    ]);
    if (senderRes.value === null) {
      return {
        ok: false,
        error: "SENDER_ACCOUNT_NOT_FOUND" as const,
      };
    }
    if (receiverRes.value === null) {
      return {
        ok: false,
        error: "RECIPIENT_ACCOUNT_NOT_FOUND" as const,
      };
    }

    const senderBalance = senderRes.value;
    const receiverBalance = receiverRes.value;

    // Ensure the sender has a sufficient balance to complete the transfer.
    if (senderBalance < amount) {
      return {
        ok: false,
        error: "INSUFFICIENT_FUNDS" as const,
      };
    }

    // Perform the transfer.
    const newSenderBalance = senderBalance - amount;
    const newReceiverBalance = receiverBalance + amount;

    res.ok = await kv
      .atomic()
      .check(senderRes) // Ensure the sender's balance hasn't changed.
      .check(receiverRes) // Ensure the receiver's balance hasn't changed.
      .set(senderKey, newSenderBalance) // Update the sender's balance.
      .set(recipientKey, newReceiverBalance) // Update the receiver's balance.
      .commit()
      .then((r) => r.ok);
  }

  return {
    ok: true,
  };
}
