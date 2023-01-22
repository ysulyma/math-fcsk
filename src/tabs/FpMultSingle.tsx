import {KTX as $} from "@liqvid/katex/plain";
import {range} from "@liqvid/utils/misc";
import {useReducer} from "react";

import {Ring} from "../App";
import {
  formatGen,
  formatTerm,
  fpiGenerator,
  GeneratorName,
  multiplyTerms,
  nygGenerator,
  syntomicProduct,
  valTerm,
} from "../generators";
import {formatSum} from "../latex";

const {raw} = String;

/**
 * What type of product to show.
 */
type Mode = "aa" | "ab";

interface State {
  mode: Mode;

  i1: number;
  j1: number;

  i2: number;
  j2: number;
}

type Action = Partial<State>;

function reducer(state: State, action: Action): State {
  return {...state, ...action};
}

const initialState: State = {
  mode: "aa",

  i1: 2,
  j1: 1,

  i2: 2,
  j2: 3,
};

export function FpMultSingle({e, p}: Ring) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <>
      {/* <h2>
        Mod-<$>p</$> ring structure (single)
      </h2> */}
      <p>
        §5.3 of the paper. We write <$>{raw`n? \mathrel{\ :=\ } (n-1)!`}</$> for
        the Gamma function. We fade terms which vanish in{" "}
        <$>{raw`H^*(\Nyg^{\ge i}\prism_R/p)`}</$> without forming an element of{" "}
        <$>{raw`H^*\F_p(i)`}</$>.
      </p>
      <fieldset>
        <VarsTable {...state} {...{e, p, dispatch}} />
        <TermsTable {...state} {...{e, p, dispatch}} />
      </fieldset>
      <Equations {...state} {...{e, p}} />
    </>
  );
}

/** Configure aa vs ab products. */
function VarsTable({
  mode,
  dispatch,
}: {
  mode: Mode;
  dispatch: React.Dispatch<Action>;
}) {
  const setRadio = (evt: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({mode: evt.currentTarget.value as Mode});
  };

  return (
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
            <$>bb</$>
          </label>
        </li>
      </ul>
    </fieldset>
  );
}

function TermsTable({
  p,
  i1,
  j1,
  i2,
  j2,
  dispatch,
}: Ring &
  State & {
    dispatch: React.Dispatch<Action>;
  }) {
  const jOptions = range(1, 25).filter((j) => j % p !== 0);

  const setI1 = (evt: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({i1: parseInt(evt.currentTarget.value)});
  };

  const setI2 = (evt: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({i2: parseInt(evt.currentTarget.value)});
  };

  const setJ1 = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({j1: parseInt(evt.currentTarget.value)});
  };

  const setJ2 = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({j2: parseInt(evt.currentTarget.value)});
  };

  return (
    <table>
      <tbody>
        <tr>
          <td>
            <$>i_1</$>
          </td>
          <td>
            <input
              onChange={setI1}
              type="number"
              min={1}
              max={10}
              step={1}
              value={i1}
            />
          </td>
          <td>
            <$>i_2</$>
          </td>
          <td>
            <input
              onChange={setI2}
              type="number"
              min={1}
              max={10}
              step={1}
              value={i2}
            />
          </td>
        </tr>
        <tr>
          <td>
            <$>j_1</$>
          </td>
          <td>
            <select value={j1} onChange={setJ1}>
              {jOptions.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </td>
          <td>
            <$>j_2</$>
          </td>
          <td>
            <select value={j2} onChange={setJ2}>
              {jOptions.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function Equations({mode, i1, j1, i2, j2, e, p}: Ring & State) {
  const indent = " ".repeat(2);
  const newline = "\n";

  let tex = raw`\begin{align*}${newline}`;
  const spacing = "1em";

  // first term
  const gen1: GeneratorName = {
    i: i1,
    j: j1,
    k: 0,
  };
  const a1 = formatGen(gen1);
  const explicit1 = fpiGenerator({e, p, gen: gen1});
  tex += raw`${indent}${a1} &= ${formatSum(
    explicit1.map(formatTerm),
  )}\\[${spacing}]${newline}`;

  // second term
  const gen2 = {
    i: i2,
    j: j2,
    k: mode === "aa" ? 0 : 1,
  };
  const ab2 = formatGen(gen2);
  const explicit2 = fpiGenerator({e, p, gen: gen2});
  tex += raw`${indent}${ab2} &= ${formatSum(
    explicit2.map(formatTerm),
  )}\\[${spacing}]${newline}`;

  // product, expanded
  tex += [indent, raw`${a1}${ab2} &= \sum\left(`, newline].join("");
  tex += [
    indent.repeat(2),
    raw`\begin{array}{${"c".repeat(explicit1.length)}}`,
    newline,
  ].join("");

  tex += explicit2
    .map(
      (term2) =>
        indent.repeat(3) +
        explicit1
          .map((term1) => {
            const product = multiplyTerms(term1, term2);

            // check if it vanishes
            const nyg = nygGenerator({
              d: product.degree,
              e,
              i: i1 + i2,
              k: product.dlog ? 1 : 0,
            });

            let str = "";
            if (valTerm(product, p) > valTerm(nyg, p)) {
              str += raw`\color{gray} `;
            }
            str += formatTerm(product);

            return str;
          })
          .join(" & "),
    )
    .join(raw`\\[${spacing}]${newline}`);
  tex += [
    newline,
    indent.repeat(2) + raw`\end{array}`,
    newline,
    indent + raw`\right)\\[${spacing}]`,
    newline,
  ].join("");

  // product, simplified
  const final = syntomicProduct({
    gen1,
    gen2,
    e,
    p,
  });
  tex += raw` &= ${formatSum(final.map(formatGen))}`;
  // end
  tex += indent + newline + raw`\end{align*}`;

  // the author of @liqvid/mathjax is a dumbass, so this
  // won't work without span
  return (
    <>
      <$ display>{tex}</$>
      <div className="tex-source">
        <$>\TeX</$> code:
        <pre>
          <code>{tex}</code>
        </pre>
      </div>
    </>
  );
}
