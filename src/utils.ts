const { floor } = Math;

/** Get the p-adic valuation of n! */
export function legendre(n: number, p: number): number {
  let sum = 0;
  for (let r = 1; ; ++r) {
    const f = floor(n / p ** r);
    if (f === 0) break;
    sum += f;
  }
  return sum;
}

/** Get the factorial of n */
export function factorial(n: number): number {
  if (n === 0) return 1;
  return n * factorial(n - 1);
}

/** Get the p-adic valuation of n */
export function valp(n: number, p: number): number {
  if (n % p !== 0) return 0;
  return valp(n / p, p) + 1;
}

/** Get j from p^r j */
export function reduceP(n: number, p: number): number {
  if (n % p !== 0) return n;
  return reduceP(n / p, p);
}

/**
 * Compute ceiling of log base p of n.
 * Note that `Math.ceil(Math.log(n) / Math.log(p))`
 * will give incorrect results, e.g. for n = 9 and p = 3.
 */
export function logceil(n: number, p: number): number {
  if (n <= p) return 1;
  return logceil(n / p, p) + 1;
}

/**
 * Compute floor of log base p of n.
 * Note that `Math.floor(Math.log(n) / Math.log(p))`
 * can give incorrect results.
 */
export function logfloor(n: number, p: number): number {
  if (n < p) return 0;
  return logfloor(n / p, p) + 1;
}

/**
 * Whether `n` is a power of `p`.
 */
export function isPowerOfP(n: number, p: number): boolean {
  if (n === 0) return false;
  if (n === 1) return true;
  return n % p === 0 && isPowerOfP(n / p, p);
}

/**
 * Format a monomial expression.
 */
export function fmt(obj: Record<string, number>) {
  let isEmpty = true;
  const terms = Object.keys(obj).map((key) => {
    if (obj[key] === 0) return "";
    isEmpty = false;
    if (obj[key] === 1) return key;
    return `${key}^{${obj[key]}}`;
  });
  if (isEmpty) return "1";
  return terms.join(" ");
}

/**
 * Format `name` raised to the power `r`.
 */
export function fpow(name: number | string, r: number, zero = "") {
  if (r === 0) return zero;
  return name + (r === 1 ? "" : "^{" + r + "}");
}

export function epsilon({
  i,
  d,
  e,
  p,
}: {
  i: number;
  d: number;
  e: number;
  p: number;
}): number {
  if (d % e === 0 || i < d / e) return 1;
  return p;
}

export function brace(d: number, e: number) {
  return d % e === 0 ? e : d;
}
