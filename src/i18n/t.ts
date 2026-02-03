import type { Messages } from "./getMessages";

function getValue(messages: Messages, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (!acc || typeof acc !== "object") return undefined;
    const record = acc as Record<string, unknown>;
    return record[part];
  }, messages);
}

export function t(messages: Messages) {
  return (key: string, fallback?: string): string => {
    const value = getValue(messages, key);
    if (typeof value === "string") return value;
    return fallback ?? key;
  };
}
