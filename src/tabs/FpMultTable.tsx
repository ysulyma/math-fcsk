import {MJX} from "@liqvid/mathjax/plain";
import {range} from "@liqvid/utils/misc";
import {Fragment} from "react";

import {Ring} from "../App";
import {formatGen, GeneratorName, syntomicProduct} from "../generators";
import {formatSum} from "../latex";

const {raw} = String;

export function FpMultTable({e, p}: Ring) {
  return <LatexTable {...{e, p}} />;
}

export function ProductsTable({e, p}: Ring) {
  const mode = "aa";
  const k = mode === "aa" ? 0 : 1;
  const minI = 1;
  const maxI = 5;

  return (
    <table className="products">
      <thead>
        <tr>
          <th colSpan={2} rowSpan={2}>
            <MJX span>{raw`\K_*(k[x]/x^{${e}};\F_{${p}})`}</MJX>
          </th>
          {range(minI, maxI).map((i) => (
            <th colSpan={validJs({e, i, p}).length} key={i}>
              <MJX span>{raw`\K_{${2 * i - k}}`}</MJX>
            </th>
          ))}
        </tr>
        <tr>
          {range(minI, maxI).map((i) => (
            <Fragment key={i}>
              {validJs({e, i, p}).map((j) => (
                <th key={j}>
                  <MJX span>{formatGen({i, j, k})}</MJX>
                </th>
              ))}
            </Fragment>
          ))}
        </tr>
      </thead>
      <tbody>
        {range(minI, maxI).map((i1) => (
          <Fragment key={i1}>
            {validJs({e, i: i1, p}).map((j1) => (
              <tr key={j1}>
                {j1 === 1 && (
                  <th rowSpan={validJs({e, i: i1, p}).length}>
                    <MJX span>{raw`\K_{${2 * i1}}`}</MJX>
                  </th>
                )}
                <th>
                  <MJX span>{formatGen({i: i1, j: j1, k: 0})}</MJX>
                </th>
                {range(minI, maxI).map((i2) => (
                  <Fragment key={i2}>
                    {validJs({e, i: i2, p}).map((j2) => {
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
                          {product.length > 0 && <MJX span>{tex}</MJX>}
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

function LatexTable({e, p}: Ring) {
  const mode = "ab";
  const k = mode === "aa" ? 0 : 1;
  const minI = 1;
  const maxI = 4;

  const indent = " ".repeat(2);
  const newline = "\n";

  let tex = "";

  const is = range(minI, maxI + 1);

  // begin
  const colCount =
    2 + is.map((i) => validJs({e, i, p}).length).reduce((a, b) => a + b, 0);
  tex += raw`\begin{tabular}{|cc?*{${colCount - 2}}{c|}}${newline}`;
  tex += join(indent, raw`\hline`, newline);

  // table top corner
  tex += join(
    indent,
    raw`\multicolumn{2}{|c?}{\multirow{2}{*}{$\K_*(\F_{${p}}[x]/x^{${e}};\F_{${p}})$}}`,
  );

  // K column headers
  for (let i = minI; i <= maxI; i++) {
    const js = validJs({e, i, p});
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
      const js = validJs({e, i, p});
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
        validJs({e, i, p})
          .map((j) => `$${formatGen({i, j, k})}$`)
          .join(" & "),
      )
      .join(" & "),
    raw`\\${newline}`,
  );
  tex += join(indent, raw`\Xhline{1pt}`, newline);

  // table body
  for (const i1 of is) {
    const js = validJs({e, i: i1, p});

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
        const js = validJs({e, i: i2, p});

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
      <textarea value={tex} />
      {/* <MJX span>\TeX</MJX> code:
      <pre>
        <code>{tex}</code>
      </pre> */}
    </div>
  );
}

function validJs({e, i, p}: {e: number; i: number; p: number}): number[] {
  return range(1, e * i + 1).filter((j) => j % p !== 0);
}

function join(...args: string[]): string {
  return args.join("");
}
