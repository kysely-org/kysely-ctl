export function isTSFile(path: string): boolean {
  return (
    (path.endsWith(".ts") && !path.endsWith(".d.ts")) ||
    (path.endsWith(".cts") && !path.endsWith(".d.cts")) ||
    (path.endsWith(".mts") && !path.endsWith(".d.mts"))
  );
}
