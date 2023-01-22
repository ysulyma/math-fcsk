import {protect} from "./latex";
import {
  brace,
  logceil,
  logfloor,
  factorial,
  fpow,
  valp,
  reduceP,
  epsilon,
  legendre,
} from "./utils";

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
  denomValP: number;
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
    const d = p ** r * j;

    /** Image of the differential */
    const nygDiff = epsilon({i, d, e, p}) * brace(d, e);

    // only include cocyles
    if (nygDiff % p === 0) {
      terms.push(
        nygGenerator({
          d,
          e,
          i,
          k,
          p,
        }),
      );
    }
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
  p,
}: {
  d: number;
  e: number;
  i: number;
  k: number;
  p: number;
}): Term {
  /** Hodge degree */
  const hodge = k === 0 ? floor(d / e) : ceil(d / e);

  return {
    pPower: max(0, i - hodge),
    degree: d,
    denomValP: legendre(hodge - k, p),
    denomString: hodge + "!?"[k],
    dlog: k === 1,
  };
}

/**
 * Format a {@link Term term}.
 */
export function formatTerm({pPower, degree, denomString, dlog}: Term): string {
  let str = "";

  str += fpow("p", pPower);

  const numerator = fpow("x", degree);
  const simpleDenom = simplify(denomString);
  if (simpleDenom === "") {
    str += numerator;
  } else {
    str += raw`\dfrac{${numerator}}{${simpleDenom}}`;
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
    denomValP: a.denomValP + b.denomValP,
    denomString: `${a.denomString}${b.denomString}`,
    dlog: a.dlog || b.dlog,
  };
}

/**
 * Get the p-adic valuation of the coefficient of a term.
 */
export function valTerm(term: Term): number {
  return term.pPower - term.denomValP;
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

  if (sum1.length === 0 || sum2.length === 0) {
    return [];
  }

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
      p,
    });

    if (valTerm(product) === valTerm(nyg)) {
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
