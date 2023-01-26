// all the code in this repo sucks,
// but this one especially sucks
import {KTX as $} from "@liqvid/katex/plain";
import {useEffect, useRef, useState} from "react";

import {Ring} from "../App";

export function Interlocking({p}: Ring) {
  const [m, setM] = useState(12);
  const [n, setN] = useState(11);

  return (
    <>
      <p>§5.2 of the paper.</p>
      <VarsTable {...{m, n, setM, setN}} />
      <Canvas {...{p, m, n}} />
    </>
  );
}

type Config = {m: number; n: number};

function VarsTable({
  m,
  n,
  setM,
  setN,
}: Config & {setM: (m: number) => void; setN: (n: number) => void}) {
  const onChangeM = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(evt.currentTarget.value);

    if (!isNaN(value)) {
      setM(value);
    }
  };

  const onChangeN = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(evt.currentTarget.value);

    if (!isNaN(value)) {
      setN(value);
    }
  };

  return (
    <fieldset>
      <table>
        <tbody>
          <tr>
            <td>
              <$>m</$>
            </td>
            <td>
              <input
                onChange={onChangeM}
                type="number"
                min={n + 1}
                max={20}
                step={1}
                value={m}
              />
            </td>
          </tr>
          <tr>
            <td>
              <$>n</$>
            </td>
            <td>
              <input
                onChange={onChangeN}
                type="number"
                min={2}
                max={m - 1}
                step={1}
                value={n}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </fieldset>
  );
}

function Canvas({p, m, n}: Config & Pick<Ring, "p">) {
  const canvas = useRef() as React.MutableRefObject<HTMLCanvasElement>;
  const xmax = 150;
  const ymax = 150;

  useEffect(() => {
    // sizing
    const {height, width} = canvas.current.getBoundingClientRect();
    canvas.current.width = width;
    canvas.current.height = height;

    // draw
    const ctx = canvas.current.getContext("2d")!;

    drawVanishingRegions({ctx, xmax, ymax, height, width, p, m, n});
    drawBars({ctx, xmax, ymax, height, width, p, m, n});
    drawSlopes({ctx, xmax, ymax, height, width, p, m, n});
    drawAxes({ctx, xmax, ymax, height, width});
  }, [p, m, n]);
  return <canvas className="interlocking" ref={canvas} />;
}

type Dims = Pick<HTMLCanvasElement, "height" | "width">;

/**
 * Draw axes for the graph.
 */
function drawAxes({
  ctx,
  xmax,
  ymax,
  height,
  width,
}: Dims & {ctx: CanvasRenderingContext2D; xmax: number; ymax: number}): void {
  const padding = width / 8;
  const offset = padding / 5;

  const xTickDistance = 20;
  const yTickDistance = 20;

  const unitX = (width - padding) / xmax;
  const unitY = (height - padding) / ymax;

  ctx.fillStyle = "black";
  ctx.strokeStyle = "black";
  ctx.textBaseline = "middle";

  // border
  ctx.beginPath();
  ctx.moveTo(padding, 0);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width, height - padding);
  ctx.stroke();

  // numbering
  ctx.font = "24px KaTeX_Main";
  for (let x = 0; x <= xmax; x += xTickDistance) {
    ctx.fillText(String(x), padding + x * unitX, height - padding + offset);
  }

  ctx.textAlign = "right";
  for (let y = 0; y <= ymax; y += yTickDistance) {
    ctx.fillText(String(y), padding - offset / 2, height - padding - y * unitY);
  }

  // labels
  ctx.font = "28px KaTeX_Math";
  ctx.textAlign = "center";

  // j label

  ctx.fillText("j", (width + padding) / 2, height - padding / 3);

  // i label
  ctx.fillText("i", padding / 3, (height - padding) / 2);
}

/**
 * Draw the bars where $\pi^*$ is nonzero.
 */
function drawBars({
  ctx,
  xmax,
  ymax,
  height,
  width,
  m,
  n,
  p,
}: Config &
  Dims &
  Pick<Ring, "p"> & {
    ctx: CanvasRenderingContext2D;
    xmax: number;
    ymax: number;
  }): void {
  ctx.fillStyle = "red";
  const padding = width / 8;

  const unitX = (width - padding) / xmax;
  const unitY = (height - padding) / ymax;

  // bars
  for (let j = 1; j <= xmax; ++j) {
    let min = 0,
      max;
    // skip divisible by p
    if (j % p === 0) continue;
    // denominator bars
    for (let i = 0; i <= ymax; ++i) {
      if (s({p, k: n, i, j}) === 0) {
        min = i;
        continue;
      }
      if (alpha({m, n, p, i, j}) >= s({p, k: n, i, j})) {
        max = i;
        break;
      }
    }
    if (max !== undefined && max > min + 1) {
      ctx.fillRect(
        padding + (j - 0.5) * unitX,
        height - padding - max * unitY,
        unitX,
        (max - min - 1) * unitY,
      );
    }
  }
}

/**
 * Draw the slope lines.
 */
function drawSlopes({
  ctx,
  m,
  // n,
  p,
  xmax,
  ymax,
  height,
  width,
}: Config &
  Dims &
  Pick<Ring, "p"> & {
    ctx: CanvasRenderingContext2D;
    xmax: number;
    ymax: number;
  }): void {
  ctx.strokeStyle = "blue";
  ctx.stroke;
  const padding = width / 8;

  const unitX = (width - padding) / xmax;
  const unitY = (height - padding) / ymax;
  for (let r = 0; r <= 8; ++r) {
    const slope = p ** r / m;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(padding + xmax * unitX, height - padding - slope * xmax * unitY);
    ctx.stroke();
    ctx.closePath();
  }
}

/**
 * Shade the regions where $\pi^*$ is forced to vanish
 * in order for our result to agree with Hesselholt's.
 */
function drawVanishingRegions({
  ctx,
  xmax,
  ymax,
  height,
  width,
  m,
  n,
  p,
}: Config &
  Dims &
  Pick<Ring, "p"> & {
    ctx: CanvasRenderingContext2D;
    xmax: number;
    ymax: number;
  }): void {
  ctx.fillStyle = "lightgreen";
  const padding = width / 8;

  const unitX = (width - padding) / xmax;

  for (let r = 1; r <= 2; ++r) {
    for (let k = 1; k <= 5; ++k) {
      const left = k * p ** r * n;
      const right = k * p ** r * m;
      ctx.fillRect(
        padding + left * unitX,
        0,
        (right - left) * unitX,
        height - padding,
      );
    }
  }
}

// Hesselholt's functions
function s({
  p,
  i,
  j,
  k,
}: Pick<Ring, "p"> & {k: number; i: number; j: number}): number {
  if (j > k * (i + 1)) return 0;
  for (let r = 1; ; ++r) {
    if (p ** r * j > k * (i + 1)) return r;
  }
  // return logfloor(k * (i+1) / j, p)+1;
}

// counting how many multiples of p, j we can fit in
// k * (i+1)

function alpha({
  m,
  n,
  p,
  i,
  j,
}: Config & Pick<Ring, "p"> & {i: number; j: number}): number {
  let sum = 0;
  for (let h = 0; h < i; ++h) {
    sum += s({k: m, i: h, j, p}) - s({k: n, i: h, j, p});
  }
  return sum;
}
