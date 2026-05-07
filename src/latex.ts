/**
 * Format a sum of elements.
 */
export function formatSum(summands: string[]): string {
  if (summands.length === 0) {
    return "0";
  }

  return summands.join(" + ");
}

export function protect<T extends { toString(): string }>(x: T): string {
  if (x.toString().length > 1) {
    return `{${x}}`;
  }
  return x.toString();
}
