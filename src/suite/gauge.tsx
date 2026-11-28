export type GaugeTone = "below" | "within" | "above";

export const gaugeTone = (value: number, band: { min: number; max: number }): GaugeTone =>
  value < band.min ? "below" : value > band.max ? "above" : "within";

const R = 118;
const STROKE = 22;
const CX = 150;
const CY = 150;

const point = (t: number, r = R): [number, number] => {
  const a = Math.PI * (1 - t);
  return [CX + r * Math.cos(a), CY - r * Math.sin(a)];
};

const arcPath = (t0: number, t1: number) => {
  const [x0, y0] = point(t0);
  const [x1, y1] = point(t1);
  return `M${x0.toFixed(1)},${y0.toFixed(1)} A${R},${R} 0 0 1 ${x1.toFixed(1)},${y1.toFixed(1)}`;
};

export function ArcGauge({
  value,
  band,
  scale,
  unit,
  label,
  format = (n) => n.toLocaleString("en"),
}: {
  value: number;
  band: { min: number; max: number };
  scale?: { from: number; to: number };
  unit: string;
  label: string;
  format?: (n: number) => string;
}) {
  const from = scale?.from ?? 0;
  const to = Math.max(scale?.to ?? band.max * 1.3, value, band.max, from + 1);
  const at = (v: number) => Math.max(0, Math.min(1, (v - from) / (to - from)));
  const t = at(value);
  const [x0, y0] = point(t, R - STROKE / 2 - 6);
  const [x1, y1] = point(t, R + STROKE / 2 + 6);
  const tone = gaugeTone(value, band);
  return (
    <svg
      className="tk-gauge"
      viewBox="0 0 300 180"
      role="img"
      aria-label={`${label}: ${format(value)} ${unit}, usual ${format(band.min)} to ${format(band.max)}`}
    >
      <path
        d={arcPath(0, 1)}
        className="tk-gauge-track"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <path
        d={arcPath(at(band.min), at(band.max))}
        className="tk-gauge-band"
        strokeWidth={STROKE}
      />
      <line
        x1={x0.toFixed(1)}
        y1={y0.toFixed(1)}
        x2={x1.toFixed(1)}
        y2={y1.toFixed(1)}
        className="tk-gauge-mark"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <circle cx={x1.toFixed(1)} cy={y1.toFixed(1)} r={6} className={`tk-gauge-dot is-${tone}`} />
      <text x={CX} y={CY - 18} textAnchor="middle" className="tk-gauge-value">
        {format(value)}
      </text>
      <text x={CX} y={CY + 4} textAnchor="middle" className="tk-gauge-unit">
        {unit}
      </text>
      <text x={CX - R} y={CY + 26} textAnchor="middle" className="tk-gauge-edge">
        {format(from)}
      </text>
      <text x={CX + R} y={CY + 26} textAnchor="middle" className="tk-gauge-edge">
        {format(to)}
      </text>
    </svg>
  );
}
