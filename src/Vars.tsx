import {MJX} from "@liqvid/mathjax/plain";
import {range} from "@liqvid/utils/misc";

// pretty sure this is all of them
const primes = [2, 3, 5];

export function Vars({
  e,
  i,
  j,
  k,
  p,
  setE,
  setI,
  setJ,
  setK,
  setP,
}: {
  e: number;
  i: number;
  j: number;
  k: 0 | 1;
  p: number;

  setE: React.Dispatch<React.SetStateAction<number>>;
  setI: React.Dispatch<React.SetStateAction<number>>;
  setJ: React.Dispatch<React.SetStateAction<number>>;
  setK: React.Dispatch<React.SetStateAction<0 | 1>>;
  setP: React.Dispatch<React.SetStateAction<number>>;
}) {
  const jOptions = range(1, 51).filter((j) => j % p !== 0);

  return (
    <fieldset>
      <table>
        <tbody>
          <tr>
            <td>
              <MJX>p</MJX>
            </td>
            <td>
              <select
                value={p}
                onChange={(e) => setP(parseInt(e.currentTarget.value))}
              >
                {primes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <td>
              <MJX>e</MJX>
            </td>
            <td>
              <input
                type="number"
                min={2}
                max={12}
                step={1}
                value={e}
                onChange={(evt) => setE(parseInt(evt.currentTarget.value))}
              />
            </td>
          </tr>
          <tr>
            <td>
              <MJX>i</MJX>
            </td>
            <td>
              <input
                type="number"
                min={1}
                max={10}
                step={1}
                value={i}
                onChange={(evt) => setI(parseInt(evt.currentTarget.value))}
              />
            </td>
          </tr>
          <tr>
            <td>
              <MJX>j</MJX>
            </td>
            <td>
              <select
                value={j}
                onChange={(evt) => setJ(parseInt(evt.currentTarget.value))}
              >
                {jOptions.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <td>
              <MJX>k</MJX>
            </td>
            <td>
              <select
                value={k}
                onChange={(evt) =>
                  setK(parseInt(evt.currentTarget.value) as 0 | 1)
                }
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </fieldset>
  );
}
