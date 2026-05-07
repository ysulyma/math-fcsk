import { KTX as $ } from "@liqvid/katex/plain";
// import {MJX} from "@liqvid/mathjax/plain";
import * as Tabs from "@radix-ui/react-tabs";
import { useReducer } from "react";

import { Bands } from "./tabs/Bands.tsx";
import { FpMultSingle } from "./tabs/FpMultSingle.tsx";
import { FpMultTable } from "./tabs/FpMultTable.tsx";

import "./styles.css";
import { Interlocking } from "./tabs/Interlocking.tsx";

// for LaTeX
const { raw } = String;

// tabs
interface TabData {
  key: string;
  title: React.ReactNode;
  component: (props: Ring) => JSX.Element;
}
const tabs: TabData[] = [
  {
    component: Bands,
    key: "can-phi",
    title: (
      <>
        Actions of <$>\ \can\ </$> and <$>\ \varphi</$>
      </>
    ),
  },
  {
    component: Interlocking,
    key: "interlocking",
    title: "Interlocking slopes",
  },
  {
    component: FpMultSingle,
    key: "fp-single",
    title: (
      <>
        Mod-<$>{raw`p\ `}</$> individual products
      </>
    ),
  },
  {
    component: FpMultTable,
    key: "fp-table",
    title: (
      <>
        Mod-<$>{raw`p\ `}</$> times table
      </>
    ),
  },
];

/** Which ring we're calculating for */
export interface Ring {
  /** Prime */
  p: number;

  /** Exponent */
  e: number;
}

type Action = Partial<Ring>;

function reducer(state: Ring, action: Action): Ring {
  return { ...state, ...action };
}

const initialState: Ring = {
  e: 4,
  p: 2,
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
          <a
            href="https://arxiv.org/abs/2110.04978"
            rel="noopener"
            target="_blank"
          >
            Floor, ceiling, slopes, and <$>K</$>-theory
          </a>
        </cite>
        . The source code is available{" "}
        <a
          href="https://github.com/ysulyma/math-fcsk"
          rel="noopener"
          target="_blank"
        >
          on GitHub
        </a>
        .
      </p>
      <fieldset>
        <VarsTable {...ring} dispatch={dispatch} />
      </fieldset>
      {/* see https://www.radix-ui.com/docs/primitives/components/tabs */}
      <Tabs.Root className="TabsRoot" defaultValue="interlocking">
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
            <Tabs.Content
              className="TabsContent"
              forceMount
              key={t.key}
              value={t.key}
            >
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
    dispatch({ p: parseInt(evt.currentTarget.value) });
  };

  const setE = (evt: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ e: parseInt(evt.currentTarget.value) });
  };

  return (
    <table>
      <tbody>
        <tr>
          <th>
            <$>p</$>
          </th>
          <td>
            <select onChange={setP} value={p}>
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
            <$>e</$>
          </th>
          <td>
            <input
              max={12}
              min={2}
              onChange={setE}
              step={1}
              type="number"
              value={e}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
