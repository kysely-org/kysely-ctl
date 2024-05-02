import { CommandContext } from "citty";

/**
 * Check if the current command is a subcommand.
 */
export function isInSubcommand(context: CommandContext): boolean {
  const {
    args,
    cmd: { subCommands },
    rawArgs,
  } = context;

  if (!subCommands) {
    return false;
  }

  const potentialSubCommand = rawArgs.find((arg) => !arg.startsWith("-"));

  return (
    potentialSubCommand !== undefined && potentialSubCommand in subCommands
  );
}
