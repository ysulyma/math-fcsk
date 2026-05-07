import { KTX as $ } from "@liqvid/katex/plain";
import { MJX } from "@liqvid/mathjax/plain";
import { between, range } from "@liqvid/utils/misc";
import { useState } from "react";

import type { Ring } from "../App.tsx";
import { macros } from "../macros.ts";
import { brace, epsilon, fpow, logceil, logfloor, valp } from "../utils.ts";

const { ceil, floor, max } = Math;
const { raw } = String;

type Mode = "integral" | "mod-p";

export function Bands({ e, p }: Ring) {
  const [i, setI] = useState(2);
  const [j, setJ] = useState(1);
  const [k, setK] = useState<0 | 1>(1);
  const [mode, setMode] = useState<Mode>("integral");

  return (
    <>
      <p>Figure 1 of the paper, also relevant in §5.3.</p>
      <Vars {...{ i, j, k, mode, p, setI, setJ, setK, setMode }} />
      <MJX>{macros}</MJX>
      <Diagram {...{ e, i, j, k, mode, p }} />
    </>
  );
}

/** Display the p^* j sequence. */
export function Diagram({
  mode,
  e,
  i,
  j,
  k,
  p,
}: Ring & {
  i: number;
  j: number;

  /** Cohomological degree */
  k: 0 | 1;

  mode: Mode;
}) {
  // k=0 only valid for mod p coefficients
  if (mode === "integral") {
    k = 1;
  }

  let doc = "";

  doc += raw`${"\\"}xymatrix@R=1em{`;
  const rows = [];

  // header
  {
    const row = [];
    const prism = raw`\prism_{k[x]/x^{${e}}}`;
    row.push(
      raw`${"\\"}underline{\mathrm H^{${k}}(\mathcal N^{\ge${i}}${prism}${mode === "mod-p" ? "/p" : ""})}`,
    );
    row.push(
      raw`${"\\"}underline{\mathrm H^{${k}}(${prism}${mode === "mod-p" ? "/p" : ""})}`,
    );

    rows.push(row.join(" & "));
  }

  const NUM_ROWS = 6;

  for (let a = 0; a <= NUM_ROWS; ++a) {
    /** Polynomial degree */
    const d = j * p ** a;
    const row = [];

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

    let Nyg: string, normal: string;

    /** Image of the differential */
    const nygDiff = epsilon({ d, e, i, p }) * brace(d, e);

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

    let mod = mode === "integral" ? `W/${p ** valp(nygDiff, p)}` : "k";

    Nyg += raw`${mod}\<`;
    Nyg += raw`${fpow(p, max(0, i - hodge))}`;
    Nyg += raw`${frac}\>`;
    if (box) {
      Nyg += raw`}`;
    }

    if (a !== NUM_ROWS) {
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
    mod = mode === "integral" ? `W/${p ** valp(diff, p)}` : "k";
    normal += raw`${mod}\<${frac}\>`;
    // if (diff === 1) normal = raw`\phantom{${normal}}`;

    row.push(Nyg, normal);

    rows.push(row.join(" & "));
  }

  doc += rows.join(" \\\\ ");
  doc += raw`}`;

  // the author of @liqvid/mathjax is a fool, so this
  // won't work without span
  return (
    <MJX display span>
      {doc}
    </MJX>
  );
}

export function Vars({
  i,
  j,
  k,
  p,
  mode,
  setI,
  setJ,
  setK,
  setMode,
}: {
  i: number;
  j: number;
  k: 0 | 1;
  p: number;
  mode: Mode;

  setI: React.Dispatch<React.SetStateAction<number>>;
  setJ: React.Dispatch<React.SetStateAction<number>>;
  setK: React.Dispatch<React.SetStateAction<0 | 1>>;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
}) {
  const jOptions = range(1, 26).filter((j) => j % p !== 0);

  return (
    <fieldset>
      <table>
        <tbody>
          <tr>
            <td>
              <$>i</$>
            </td>
            <td>
              <input
                max={10}
                min={1}
                onChange={(evt) => setI(parseInt(evt.currentTarget.value, 10))}
                step={1}
                type="number"
                value={i}
              />
            </td>
            <td>coefficients</td>
            <td>
              <select
                onChange={(evt) => setMode(evt.currentTarget.value as Mode)}
                value={mode}
              >
                <option value="integral">integral</option>
                <option value="mod-p">mod p</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>
              <$>j</$>
            </td>
            <td>
              <select
                onChange={(evt) => setJ(parseInt(evt.currentTarget.value, 10))}
                value={j}
              >
                {jOptions.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </td>
            {mode === "mod-p" && (
              <>
                <td>
                  <$>k</$>
                </td>
                <td>
                  <select
                    onChange={(evt) =>
                      setK(parseInt(evt.currentTarget.value, 10) as 0 | 1)
                    }
                    value={k}
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                  </select>
                </td>
              </>
            )}
          </tr>
        </tbody>
      </table>
    </fieldset>
  );
}
