import {MJX} from "@liqvid/mathjax/plain";
import {useReducer, useState} from "react";

import {macros} from "./macros";

import "./styles.css";
import {FpMultSingle} from "./tabs/FpMultSingle";
import {FpMultTable, ProductsTable} from "./tabs/FpMultTable";

import {InlineMath as $} from "react-katex";
import "katex/dist/katex.min.css";

/**
 * What type of product to show.
 */
type Mode = "aa" | "ab";

const {raw} = String;

/** Which ring we're calculating for */
export interface Ring {
  p: number;
  e: number;
}

type Action = Partial<Ring>;

function reducer(state: Ring, action: Action): Ring {
  return {...state, ...action};
}

const initialState: Ring = {
  p: 2,
  e: 4,
};

// pretty sure this is all of them
const primes = [2, 3, 5];

const TABS = ["fp-single", "fp-table"] as const;
const tabTitles = {
  "fp-single": (
    <>
      <$>{raw`\K_*(R;F_p)`}</$> (individual)
    </>
  ),
  "fp-table": "$K_*(R;F_p)$ (table)",
};
type Tab = (typeof TABS)[number];

export default function App() {
  const [tab, setTab] = useState<Tab>("fp-table");
  const [ring, dispatch] = useReducer(reducer, initialState);

  return (
    <div className="App">
      <p>
        These are interactive widgets to explore the results/figures in my paper{" "}
        <cite>
          <a href="https://arxiv.org/abs/2110.04978" target="_blank">
            Floor, ceiling, slopes, and <$>K</$>-theory
          </a>
        </cite>
        . The source code is available{" "}
        <a href="https://github.com/ysulyma/math-fcsk" target="_blank">
          on GitHub
        </a>
        .
      </p>
      <MJX>{macros}</MJX>
      <fieldset>
        <VarsTable {...ring} dispatch={dispatch} />
      </fieldset>
      <ul>
        {TABS.map((t) => (
          <li key={t}>
            <button onClick={() => setTab(t)}>{tabTitles[t]}</button>
          </li>
        ))}
      </ul>
      {tab === "fp-single" && <FpMultSingle {...ring} />}
      {tab === "fp-table" && <FpMultTable {...ring} />}
    </div>
  );
}

function VarsTable({
  e,
  p,
  dispatch,
}: Ring & {
  dispatch: React.Dispatch<Action>;
}) {
  const setP = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({p: parseInt(evt.currentTarget.value)});
  };

  const setE = (evt: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({e: parseInt(evt.currentTarget.value)});
  };

  // const setRadio = (evt: React.ChangeEvent<HTMLInputElement>) => {
  //   dispatch({mode: evt.currentTarget.value as Mode});
  // };

  return (
    <table>
      <tbody>
        <tr>
          <th>
            <MJX>p</MJX>
          </th>
          <td>
            <select value={p} onChange={setP}>
              {primes.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </td>
        </tr>
        <tr>
          <th>
            <MJX>e</MJX>
          </th>
          <td>
            <input
              type="number"
              min={2}
              max={12}
              step={1}
              value={e}
              onChange={setE}
            />
          </td>
        </tr>
        {/* <tr>
          <td>Mode</td>
          <td>
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
                  <MJX>{`aa`}</MJX>
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
                  <MJX>{`ab`}</MJX>
                </label>
              </li>
            </ul>
          </td>
        </tr> */}
      </tbody>
    </table>
  );
}
