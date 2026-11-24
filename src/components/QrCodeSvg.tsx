import React from "react";

interface QrCodeSvgProps {
  value: string;
  size?: number;
}

export const QrCodeSvg: React.FC<QrCodeSvgProps> = ({ value, size = 84 }) => {
  const grid = 21;
  const cells: boolean[][] = Array.from({ length: grid }, () =>
    Array.from({ length: grid }, () => false)
  );

  // Finder patterns (3 corners)
  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r += 1) {
      for (let c = 0; c < 7; c += 1) {
        const border = r === 0 || r === 6 || c === 0 || c === 6;
        const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        cells[r0 + r][c0 + c] = border || inner;
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, grid - 7);
  drawFinder(grid - 7, 0);

  // Deterministic hash matrix from certificate verification string
  let seed = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    seed ^= value.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }

  for (let r = 0; r < grid; r += 1) {
    for (let c = 0; c < grid; c += 1) {
      const inFinder =
        (r < 8 && c < 8) ||
        (r < 8 && c >= grid - 8) ||
        (r >= grid - 8 && c < 8);
      if (!inFinder) {
        seed = Math.imul(seed ^ (r * 31 + c * 17), 16777619);
        cells[r][c] = (seed >>> 0) % 2 === 0;
      }
    }
  }

  const cellSize = size / grid;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Verification QR for ${value}`}
      className="rounded-lg bg-white p-1 shrink-0"
    >
      <rect width={size} height={size} fill="#FFFFFF" />
      {cells.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#050507"
            />
          ) : null
        )
      )}
    </svg>
  );
};
