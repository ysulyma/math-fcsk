import {protect} from "./latex";
import {logceil, logfloor, factorial, fpow, valp, reduceP} from "./utils";

const {ceil, floor, max} = Math;
const {raw} = String;

export interface GeneratorName {
  i: number;
  j: number;
  k: number;
}

export interface Term {
  dlog: boolean;
  pPower: number;
  degree: number;
  denom: number;
  denomString: string;
}

/**
 * Get the generator of $H^k(\F_p(i)_j)$
 */
export function fpiGenerator({
  gen: {i, j, k},
  e,
  p,
}: {
  gen: GeneratorName;
  e: number;
  p: number;
}): Term[] {
  /** Vector start */
  const s =
    k === 0 ? logceil((e * i) / j, p) - 1 : logfloor((e * (i - 1)) / j, p);

  /** Vector end */
  const t =
    k === 0 ? logceil((e * (i + 1)) / j, p) : logfloor((e * i) / j, p) + 1;

  const terms: Term[] = [];

  for (let r = s; r <= t; ++r) {
    terms.push(
      nygGenerator({
        d: p ** r * j,
        e,
        i,
        k,
      }),
    );
  }

  return terms;
}

/**
 * Get the generator of $H^k(\Nyg^{\ge i}\prism/p)_d$
 */
export function nygGenerator({
  d,
  e,
  i,
  k,
}: {
  d: number;
  e: number;
  i: number;
  k: number;
}): Term {
  /** Hodge degree */
  const hodge = k === 0 ? floor(d / e) : ceil(d / e);

  return {
    pPower: max(0, i - hodge),
    degree: d,
    denom: factorial(hodge - k),
    denomString: hodge + "!?"[k],
    dlog: k === 1,
  };
}

/**
 * Format a {@link Term term}.
 */
export function formatTerm({
  pPower,
  degree,
  denom,
  denomString,
  dlog,
}: Term): string {
  let str = "";

  str += fpow("p", pPower);

  const numerator = fpow("x", degree);
  if (denom === 1) {
    str += numerator;
  } else {
    str += raw`\dfrac{${numerator}}{${simplify(denomString)}}`;
  }

  if (dlog) {
    str += raw`\dlog x`;
  }

  return str;
}

/**
 * Multiply two {@link Term terms}.
 */
export function multiplyTerms(a: Term, b: Term): Term {
  return {
    pPower: a.pPower + b.pPower,
    degree: a.degree + b.degree,
    denom: a.denom * b.denom,
    denomString: `${a.denomString}${b.denomString}`,
    dlog: a.dlog || b.dlog,
  };
}

/**
 * Get the p-adic valuation of the coefficient of a term.
 */
export function valTerm(term: Term, p: number): number {
  console.log(term.denom);
  return term.pPower - valp(term.denom, p);
}

/**
 * Get the product of two elements of $\K_*(R; \F_p)$.
 */
export function syntomicProduct({
  gen1,
  gen2,
  p,
  e,
}: {
  gen1: GeneratorName;
  gen2: GeneratorName;
  p: number;
  e: number;
}): GeneratorName[] {
  const generators: GeneratorName[] = [];

  const sum1 = fpiGenerator({gen: gen1, e, p});
  const sum2 = fpiGenerator({gen: gen2, e, p});

  // only need to go across first row/column
  const products: Term[] = [];
  for (let index = 0; index < sum1.length; ++index) {
    products.push(multiplyTerms(sum1[index], sum2[0]));
  }
  for (let index = 1; index < sum2.length; ++index) {
    products.push(multiplyTerms(sum1[0], sum2[index]));
  }

  // add terms not vanishing in H^*(\Nyg^{\ge *}\prism/p)
  for (const product of products) {
    // check if it vanishes
    const nyg = nygGenerator({
      d: product.degree,
      e,
      i: gen1.i + gen2.i,
      k: product.dlog ? 1 : 0,
    });

    if (valTerm(product, p) === valTerm(nyg, p)) {
      generators.push({
        k: gen1.k + gen2.k,
        i: gen1.i + gen2.i,
        j: reduceP(product.degree, p),
      });
    }
  }

  // when p = 2, duplicated terms should vanish
  if (p === 2) {
    for (const gen of generators) {
      const occurrences = generators.filter((g) => g.j === gen.j);
      if (occurrences.length === 2) {
        for (const g of occurrences) {
          generators.splice(generators.indexOf(g), 1);
        }
      }
    }
  }

  // sort them
  generators.sort((g1, g2) => g1.j - g2.j);

  return generators;
}

export function formatGen(gen: GeneratorName): string {
  return `${"ab"[gen.k]}_${protect(gen.i)}^${protect(gen.j)}`;
}

/**
 * Remove 1's from an expression.
 */
function simplify(x: string): string {
  return x.replace(/\b([01]!|[12]\?)/g, "");
}
