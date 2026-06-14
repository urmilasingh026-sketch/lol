import { useStore } from '@/store';

interface WpmChartProps {
  width?: number;
  height?: number;
  compact?: boolean;
  className?: string;
}

export function WpmChart({ width = 160, height = 40, compact = false, className = '' }: WpmChartProps) {
  const wpmHistory = useStore(s => s.wpmHistory);
  const wpm = useStore(s => s.wpm);

  if (wpmHistory.length < 2) {
    return (
      <div
        className={`flex items-center justify-center text-white/20 text-[0.6rem] font-mono ${className}`}
        style={{ width, height }}
      >
        {compact ? '—' : 'Start typing…'}
      </div>
    );
  }

  const data = wpmHistory;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = Math.max(max - min, 10);
  const pad = 4;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const toX = (i: number) => pad + (i / (data.length - 1)) * w;
  const toY = (v: number) => pad + h - ((v - min) / range) * h;

  const points = data.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
  const areaPoints = [
    `${toX(0).toFixed(1)},${(pad + h).toFixed(1)}`,
    ...data.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`),
    `${toX(data.length - 1).toFixed(1)},${(pad + h).toFixed(1)}`,
  ].join(' ');

  const current = data[data.length - 1];
  const prev = data[data.length - 2];
  const trend = current > prev ? 'up' : current < prev ? 'down' : 'flat';

  const trendColor = trend === 'up' ? '#38e29d' : trend === 'down' ? '#ff5b55' : '#5f6bff';

  return (
    <div className={`flex flex-col gap-0.5 ${className}`} title={`WPM over last ${data.length} samples`}>
      {!compact && (
        <div className="flex items-center justify-between px-1">
          <span className="text-[0.52rem] text-white/30 uppercase tracking-widest font-semibold">WPM Trend</span>
          <span className="text-[0.62rem] font-mono font-bold" style={{ color: trendColor }}>
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '▶'} {current}
          </span>
        </div>
      )}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="wpm-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={trendColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={trendColor} stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="wpm-line-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={trendColor} stopOpacity="0.5" />
            <stop offset="100%" stopColor={trendColor} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((frac, i) => (
          <line
            key={i}
            x1={pad} y1={pad + h * frac}
            x2={pad + w} y2={pad + h * frac}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        ))}

        {/* Area fill */}
        <polygon
          points={areaPoints}
          fill="url(#wpm-area-grad)"
        />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="url(#wpm-line-grad)"
          strokeWidth={compact ? 1.5 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 3px ${trendColor}88)` }}
        />

        {/* Last point dot */}
        <circle
          cx={toX(data.length - 1)}
          cy={toY(current)}
          r={compact ? 2.5 : 3.5}
          fill={trendColor}
          style={{ filter: `drop-shadow(0 0 5px ${trendColor})` }}
        />
      </svg>

      {!compact && (
        <div className="flex justify-between px-1">
          <span className="text-[0.48rem] text-white/20 font-mono">{min} WPM</span>
          <span className="text-[0.48rem] text-white/20 font-mono">{max} WPM</span>
        </div>
      )}
    </div>
  );
}
