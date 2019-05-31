export function ensureExists<T>(object: T | null | undefined): T {
  if (object === null || object === undefined) {
    throw new Error(`unexpected ${object} found`);
  }
  return object;
}
