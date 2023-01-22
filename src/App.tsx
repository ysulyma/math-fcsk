import {KTX as $} from "@liqvid/katex/plain";
import {MJX} from "@liqvid/mathjax/plain";
import * as Tabs from "@radix-ui/react-tabs";
import {useReducer} from "react";

import {macros} from "./macros";
import {FpMultSingle} from "./tabs/FpMultSingle";
import {FpMultTable} from "./tabs/FpMultTable";
import {Interlocking} from "./tabs/Interlocking";
import "./styles.css";

// for LaTeX
const {raw} = String;

// tabs
interface TabData {
  key: string;
  title: React.ReactNode;
  component: (props: Ring) => JSX.Element;
}
const tabs: TabData[] = [
  // {
  //   key: "interlocking",
  //   title: "Interlocking slopes",
  //   component: Interlocking,
  // },
  {
    key: "fp-single",
    title: (
      <>
        Mod-<$>{raw`p\ `}</$> ring structure (individual)
      </>
    ),
    component: FpMultSingle,
  },
  {
    key: "fp-table",
    title: (
      <>
        Mod-<$>{raw`p\ `}</$> ring structure (table)
      </>
    ),
    component: FpMultTable,
  },
];

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

export default function App() {
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
      {/* see https://www.radix-ui.com/docs/primitives/components/tabs */}
      <Tabs.Root className="TabsRoot" defaultValue="fp-table">
        <Tabs.List className="TabsList">
          {tabs.map((t) => (
            <Tabs.Trigger className="TabsTrigger" key={t.key} value={t.key}>
              {t.title}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {tabs.map((t) => {
          // components need to have a capital variable name
          const Component = t.component;

          return (
            <Tabs.Content className="TabsContent" key={t.key} value={t.key}>
              <Component {...ring} />
            </Tabs.Content>
          );
        })}
      </Tabs.Root>
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
