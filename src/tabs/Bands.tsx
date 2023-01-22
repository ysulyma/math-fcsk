import {MJX} from "@liqvid/mathjax/plain";
import {between} from "@liqvid/utils/misc";
import {useState} from "react";

import {macros} from "../macros";
import {brace, epsilon, fpow, logceil, logfloor} from "../utils";
import {Vars} from "../Vars";

const {ceil, floor, max} = Math;
const {raw} = String;

export function Tower() {
  const [e, setE] = useState(4);
  const [i, setI] = useState(4);
  const [j, setJ] = useState(3);
  const [k, setK] = useState<0 | 1>(0);
  const [p, setP] = useState(2);
  return (
    <>
      <p>Figure 1 of the paper, also relevant in §5.3.</p>
      <Vars {...{e, i, j, k, p, setE, setI, setJ, setK, setP}} />
      <MJX>{macros}</MJX>
      <Bands es={[e]} {...{i, j, k, p}} />
    </>
  );
}

/** Display the p^* j sequence. */
export function Bands({
  es,
  i,
  j,
  k,
  p,
}: {
  es: number[];
  i: number;
  j: number;

  /** Cohomological degree */
  k: 0 | 1;

  /** Prime */
  p: number;
}) {
  let doc = "";

  doc += raw`${"\\"}xymatrix@R=1em{`;
  const rows = [];
  {
    const row = [];
    for (const e of es) {
      row.push(
        raw`${"\\"}underline{H^{${k}}(\mathcal N^{\ge${i}}\prism_{k[x]/x^{${e}}}/p)}`,
      );
      row.push(raw`${"\\"}underline{H^{${k}}(\prism_{k[x]/x^{${e}}}/p)}`);
    }
    rows.push(row.join(" & "));
  }

  for (let a = 0; a <= 6; ++a) {
    /** Polynomial degree */
    const d = j * p ** a;
    const row = [];
    for (const e of es) {
      /** Vector start */
      const s =
        k === 0 ? logceil((e * i) / j, p) - 1 : logfloor((e * (i - 1)) / j, p);

      /** Vector end */
      const t =
        k === 0 ? logceil((e * (i + 1)) / j, p) : logfloor((e * i) / j, p) + 1;

      /** Hodge degree */
      const hodge = k === 0 ? floor(d / e) : ceil(d / e);
      let frac = "";

      if (k === 0) {
        if (hodge > 1) frac += raw`\dfrac{`;
      } else {
        if (hodge > 2) frac += raw`\dfrac{`;
      }
      frac += fpow("x", d);

      if (k === 0) {
        if (hodge > 1) frac += raw`}{${hodge}!}`;
      } else {
        if (hodge > 2) frac += raw`}{${hodge}?}`;
        frac += raw`\dlog x`;
      }

      let Nyg, normal;

      /** Image of the differential */
      const nygDiff = epsilon({i, d, e, p}) * brace(d, e);

      // Nygaard
      Nyg = "";
      const box = between(d / p, e * i, d);
      if (box) {
        Nyg += "*+[F:gray:<1pt>]{";
      }
      if (nygDiff % p !== 0) {
        Nyg += raw`\color{lightgray}`;
      }
      if (!between(s, a, t + 1)) {
        Nyg += raw`\color{red}`;
      }

      Nyg += raw`k\<`;
      Nyg += raw`${fpow(p, max(0, i - hodge))}`;
      Nyg += raw`${frac}\>`;
      if (box) {
        Nyg += raw`}`;
      }

      if (a !== 6) {
        const diag = i >= hodge ? "" : "@{..>}";
        Nyg += raw` \ar${diag}@(r,l)[dr]`;
      }
      const hor = i > hodge ? "@{..>}" : "";
      Nyg += raw` \ar${hor}[r]`;

      // normal
      normal = "";
      const diff = brace(d, e);
      if (diff % p !== 0) {
        normal += raw`\color{lightgray}`;
      }
      normal += raw`k\<${frac}\>`;
      // if (diff === 1) normal = raw`\phantom{${normal}}`;

      row.push(Nyg, normal);
    }

    rows.push(row.join(" & "));
  }

  doc += rows.join(" \\\\ ");
  doc += raw`}`;

  // the author of @liqvid/mathjax is a dumbass, so this
  // won't work without span
  return <MJX span>{doc}</MJX>;
}
