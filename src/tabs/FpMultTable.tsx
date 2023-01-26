import {KTX as $} from "@liqvid/katex/plain";
import {range} from "@liqvid/utils/misc";
import {Fragment, useState} from "react";

import {Ring} from "../App";
import {
  formatGen,
  fpiGenerator,
  GeneratorName,
  syntomicProduct,
} from "../generators";
import {formatSum} from "../latex";

const {raw} = String;

/**
 * What type of product to show.
 */
type Mode = "aa" | "ab";

const minI = 1;
const maxI = 4;

export function FpMultTable({e, p}: Ring) {
  const [mode, setMode] = useState<Mode>("aa");

  return (
    <>
      <h2></h2>
      <p>§5.3 of the paper.</p>
      <ModeConfig {...{mode, setMode}} />
      <TimesTable {...{e, p, mode}} />
      <LatexTable {...{e, p, mode}} />
    </>
  );
}

/** Configure aa vs ab products. */
function ModeConfig({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
}) {
  const setRadio = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setMode(evt.currentTarget.value as Mode);
  };

  return (
    <form>
      <fieldset>
        Mode
        <ul className="mode-list">
          <li>
            <label>
              <input
                checked={mode === "aa"}
                onChange={setRadio}
                name="mode"
                type="radio"
                value="aa"
              />{" "}
              <$>aa</$>
            </label>
          </li>
          <li>
            <label>
              <input
                checked={mode === "ab"}
                onChange={setRadio}
                name="mode"
                type="radio"
                value="ab"
              />{" "}
              <$>ab</$>
            </label>
          </li>
        </ul>
      </fieldset>
    </form>
  );
}

/**
 * Display the products in a table.
 */
function TimesTable({e, p, mode}: Ring & {mode: Mode}) {
  const k = mode === "aa" ? 0 : 1;

  return (
    <table className="products">
      <thead>
        <tr>
          <th colSpan={2} rowSpan={2}>
            <$>{raw`\K_*(k[x]/x^{${e}};\F_{${p}})`}</$>
          </th>
          {range(minI, maxI + 1).map((i) => (
            <th colSpan={validJs({e, i, k, p}).length} key={i}>
              <$>{raw`\K_{${2 * i - k}}`}</$>
            </th>
          ))}
        </tr>
        <tr>
          {range(minI, maxI + 1).map((i) => (
            <Fragment key={i}>
              {validJs({e, i, k, p}).map((j) => (
                <th key={j}>
                  <$>{formatGen({i, j, k})}</$>
                </th>
              ))}
            </Fragment>
          ))}
        </tr>
      </thead>
      <tbody>
        {range(minI, maxI + 1).map((i1) => (
          <Fragment key={i1}>
            {validJs({e, i: i1, k: 0, p}).map((j1, index) => (
              <tr key={j1}>
                {index === 0 && (
                  <th rowSpan={validJs({e, i: i1, k: 0, p}).length}>
                    <$>{raw`\K_{${2 * i1}}`}</$>
                  </th>
                )}
                <th>
                  <$>{formatGen({i: i1, j: j1, k: 0})}</$>
                </th>
                {range(minI, maxI + 1).map((i2) => (
                  <Fragment key={i2}>
                    {validJs({e, i: i2, k, p}).map((j2) => {
                      const gen1: GeneratorName = {
                        i: i1,
                        j: j1,
                        k: 0,
                      };
                      const gen2: GeneratorName = {
                        i: i2,
                        j: j2,
                        k,
                      };
                      const product = syntomicProduct({
                        gen1,
                        gen2,
                        e,
                        p,
                      });
                      const tex = formatSum(product.map(formatGen));
                      return (
                        <td key={j2}>
                          {product.length > 0 && <$ display>{tex}</$>}
                        </td>
                      );
                    })}
                  </Fragment>
                ))}
              </tr>
            ))}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}

function LatexTable({e, p, mode}: Ring & {mode: Mode}) {
  const k = mode === "aa" ? 0 : 1;

  const indent = " ".repeat(2);
  const newline = "\n";

  let tex = "";

  const is = range(minI, maxI + 1);

  // begin
  const colCount =
    2 + is.map((i) => validJs({e, i, k, p}).length).reduce((a, b) => a + b, 0);
  tex += raw`\begin{tabular}{|cc?*{${colCount - 2}}{c|}}${newline}`;
  tex += join(indent, raw`\hline`, newline);

  // table top corner
  tex += join(
    indent,
    raw`\multicolumn{2}{|c?}{\multirow{2}{*}{$\K_*(\F_{${p}}[x]/x^{${e}};\F_{${p}})$}}`,
  );

  // K column headers
  for (let i = minI; i <= maxI; i++) {
    const js = validJs({e, i, k, p});
    tex += join(
      newline,
      indent.repeat(2),
      raw`& \multicolumn{${js.length}}{c|}{$\K_{${2 * i - k}}$}`,
    );
  }
  tex += raw`\\${newline}`;

  // K column header underlines
  let col = 3;
  tex += indent.repeat(2);
  tex += is
    .map((i) => {
      const js = validJs({e, i, k, p});

      const str = raw`\cline{${col}-${col + js.length - 1}}`;
      col += js.length;
      return str;
    })
    .join(" ");
  tex += newline;

  // generator column headers
  tex += join(
    indent.repeat(2),
    "&& ",
    is
      .map((i) =>
        validJs({e, i, k, p})
          .map((j) => `$${formatGen({i, j, k})}$`)
          .join(" & "),
      )
      .join(" & "),
    raw`\\${newline}`,
  );
  tex += join(indent, raw`\Xhline{1pt}`, newline);

  // table body
  for (const i1 of is) {
    const js = validJs({e, i: i1, k: 0, p});

    for (const j1 of js) {
      const cols = [];
      if (j1 === 1) {
        // K row header
        cols.push(
          raw`\multicolumn{1}{|c}{\multirow{${js.length}}{*}{$\K_{${
            2 * i1
          }}$}}`,
        );
      } else {
        cols.push("");
      }

      // generator row header
      cols.push(
        join(raw`\multicolumn{1}{|c?}{$${formatGen({i: i1, j: j1, k: 0})}$}`),
      );

      // products
      for (const i2 of is) {
        const js = validJs({e, i: i2, k, p});

        for (const j2 of js) {
          const gen1: GeneratorName = {
            i: i1,
            j: j1,
            k: 0,
          };
          const gen2: GeneratorName = {
            i: i2,
            j: j2,
            k,
          };
          const product = syntomicProduct({
            gen1,
            gen2,
            e,
            p,
          });
          if (product.length > 0) {
            const tex = formatSum(product.map(formatGen));
            cols.push(raw`$${tex}$`);
          } else {
            cols.push("");
          }
        }
      }

      // row
      tex += join(indent.repeat(2), cols.join(" & "), raw`\\${newline}`);

      // lines
      if (j1 === js[js.length - 1]) {
        tex += join(indent.repeat(2), raw`\hline`, newline);
      } else {
        tex += join(indent.repeat(2), raw`\cline{2-${colCount}}`, newline);
      }
    }
  }

  // end
  tex += raw`\end{tabular}${newline}`;

  // render
  return (
    <div className="tex-source">
      <$>\TeX</$> code:
      <pre>
        <code>{texHeader + tex + texFooter}</code>
      </pre>
    </div>
  );
}

function validJs({
  e,
  i,
  k,
  p,
}: {
  e: number;
  i: number;
  k: number;
  p: number;
}): number[] {
  return range(1, e * i + 1).filter((j) => {
    if (j % p === 0) {
      return false;
    }
    const gen = fpiGenerator({gen: {i, j, k}, e, p});
    if (gen.length === 0) {
      return false;
    }
    return true;
  });
}

function join(...args: string[]): string {
  return args.join("");
}

const texHeader = raw`\documentclass[border=0in]{standalone}
${"\\"}usepackage{amsmath, amssymb, amsthm}
${"\\"}usepackage{multirow}
${"\\"}usepackage{makecell}

\newcolumntype{?}{!{\vrule width 1pt}}
\renewcommand{\arraystretch}{1.2}

\newcommand{\F}{\mathbf F}
\newcommand{\K}{\mathrm K}

\begin{document}
`;

const texFooter = raw`${"\n"}\end{document}`;
