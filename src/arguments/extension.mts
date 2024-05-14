import type { ArgsDef } from "citty";

const EXTENSIONS = ["ts", "mts", "cts"] as const;

export const ExtensionArg = {
  extension: {
    alias: "x",
    default: "ts",
    description: "The file extension to use",
    type: "string",
    valueHint: EXTENSIONS.map((extension) => `"${extension}"`).join(" | "),
  },
} satisfies ArgsDef;

type Extension = (typeof EXTENSIONS)[number];

export function assertExtension(thing: unknown): asserts thing is Extension {
  if (!EXTENSIONS.includes(thing as any)) {
    throw new Error(
      `Invalid file extension "${thing}"! Expected ${ExtensionArg.extension.valueHint}`
    );
  }
}
