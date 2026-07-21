import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  21
);

export function createId(prefix?: string) {
  const id = nanoid();
  return prefix ? `${prefix}_${id}` : id;
}
