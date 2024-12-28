import type { KvEntry, KvEntryMaybe } from "@deno/kv";

export const plural = (
  number: number,
  titles: string[],
  includeNumber: boolean = false,
): string => {
  const cases = [2, 0, 1, 1, 1, 2];
  const absolute = Math.abs(number);
  const text =
    titles[
      absolute % 100 > 4 && absolute % 100 < 20
        ? 2
        : cases[absolute % 10 < 5 ? absolute % 10 : 5]
    ];
  return includeNumber ? `${number} ${text}` : text;
};

/**
 * Safely parses a number from a string.
 */
export function safeParseNumber<T extends number | undefined>(
  str: string,
  defaultValue: T,
): T extends number ? number : T {
  // Trim the string to remove leading/trailing whitespace
  const trimmedStr = str.trim();

  // Check if the trimmed string is empty
  if (trimmedStr === "") {
    return defaultValue as T extends number ? number : T;
  }

  // Attempt to parse the number
  const parsedNumber = Number(trimmedStr);

  // Check if the parsed number is finite and not NaN
  if (!isNaN(parsedNumber) && isFinite(parsedNumber)) {
    return parsedNumber as T extends number ? number : T;
  }

  // Return the default value if parsing fails
  return defaultValue as T extends number ? number : T;
}

export const getRandomFromArray = <Type extends unknown>(arr: Type[]) =>
  arr[Math.floor(Math.random() * arr.length)];

export const isKvEntry = <Type extends unknown>(
  state: KvEntryMaybe<Type>,
): state is KvEntry<Type> => {
  if (state.value === null && state.versionstamp === null) return false;
  return true;
};
