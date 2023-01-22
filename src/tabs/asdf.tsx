import {MJX} from "@liqvid/mathjax/plain";
import {useState} from "react";

import {Bands} from "./Bands";
import {macros} from "./macros";
import "./styles.css";
import {Vars} from "./Vars";

export function Tower() {
  const [e, setE] = useState(4);
  const [i, setI] = useState(4);
  const [j, setJ] = useState(3);
  const [k, setK] = useState<0 | 1>(0);
  const [p, setP] = useState(2);

  return (
    <div className="App">
      <Vars {...{e, i, j, k, p, setE, setI, setJ, setK, setP}} />
      <MJX>{macros}</MJX>
      <Bands es={[e]} {...{i, j, k, p}} />
    </div>
  );
}
