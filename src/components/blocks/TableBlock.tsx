import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface Props {
  rows?: number;
  cols?: number;
  onArrowPrevBlock?: () => void;
  onArrowNextBlock?: () => void;
}

const TableBlock: React.FC<Props> = ({ rows = 5, cols = 5, onArrowPrevBlock, onArrowNextBlock }) => {
  const [data, setData] = useState<string[][]>(
    Array.from({ length: rows }, () => Array.from({ length: cols }, () => ''))
  );

  const inputsRef = useRef<Array<Array<HTMLInputElement | null>>>(
    Array.from({ length: rows }, () => Array.from({ length: cols }, () => null))
  );

  useEffect(() => {
    inputsRef.current = inputsRef.current.slice(0, rows).map(rowArr =>
      rowArr.slice(0, cols)
    );
  }, [rows, cols]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, r: number, c: number) => {
    const focusCell = (row: number, col: number) => {
      if (row < 0) {
        onArrowPrevBlock?.();
        return;
      }
      if (row >= rows) {
        onArrowNextBlock?.();
        return;
      }
      if (col < 0) col = 0;
      if (col >= cols) col = cols - 1;
      setTimeout(() => inputsRef.current[row][col]?.focus(), 0);
    };

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        focusCell(r - 1, c);
        break;
      case 'ArrowDown':
        e.preventDefault();
        focusCell(r + 1, c);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        focusCell(r, c - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        focusCell(r, c + 1);
        break;
      case 'Enter':
        if (r === data.length - 1) {
          e.preventDefault();
          setData((prev) => [...prev, Array.from({ length: cols }, () => '')]);
          inputsRef.current.push(Array.from({ length: cols }, () => null));
          setTimeout(() => inputsRef.current[r + 1][0]?.focus(), 0);
        }
        break;
      default:
        break;
    }
  };

  return (
    <table className="min-w-full border border-gray-300 text-sm my-2">
      <tbody>
        {data.map((row, rIdx) => (
          <tr key={rIdx}>
            {row.map((val, cIdx) => (
              <td key={cIdx} className="border px-1 py-0.5">
                <input
                  ref={(el) => {
                    if (!inputsRef.current[rIdx]) inputsRef.current[rIdx] = [];
                    inputsRef.current[rIdx][cIdx] = el;
                  }}
                  type="text"
                  aria-label={`Row ${rIdx} Col ${cIdx}`}
                  className="w-full bg-transparent focus:outline-none"
                  placeholder="Cell"
                  value={val}
                  onChange={(e) => {
                    const v = e.target.value;
                    setData((prev) =>
                      prev.map((r, i) =>
                        i === rIdx ? r.map((c, j) => (j === cIdx ? v : c)) : r
                      )
                    );
                  }}
                  onKeyDown={(e) => handleKeyDown(e, rIdx, cIdx)}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableBlock; 