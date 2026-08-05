import type { TeamHistoryPoint } from "@/lib/types";

export function Sparkline({ points, metric, label }: { points: TeamHistoryPoint[]; metric: "rank" | "points"; label: string }) {
  const values = points.map((point) => metric === "rank" ? point.rank ?? 26 : point.points);
  const width = 560;
  const height = 180;
  const padding = 18;
  const min = metric === "rank" ? 1 : Math.min(...values, 0);
  const max = metric === "rank" ? 26 : Math.max(...values, 1);
  const plotted = values.map((value, index) => {
    const x = points.length === 1 ? width / 2 : padding + (index / (points.length - 1)) * (width - padding * 2);
    const normalized = metric === "rank" ? (value - min) / (max - min) : (max - value) / Math.max(max - min, 1);
    const y = metric === "rank" ? padding + normalized * (height - padding * 2) : padding + normalized * (height - padding * 2);
    return { x, y, value };
  });
  const summary = points.map((point, index) => `Week ${point.week}: ${metric === "rank" ? (point.rank ? `rank ${point.rank}` : "unranked") : `${values[index]} points`}`).join(", ");
  return (
    <figure className="sparkline">
      <figcaption>{label}</figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${label}. ${summary}`}>
        <path className="chart-grid" d={`M${padding} ${padding}H${width - padding} M${padding} ${height / 2}H${width - padding} M${padding} ${height - padding}H${width - padding}`} />
        <polyline points={plotted.map((point) => `${point.x},${point.y}`).join(" ")} />
        {plotted.map((point, index) => <circle key={points[index].week} cx={point.x} cy={point.y} r="5"><title>Week {points[index].week}: {metric === "rank" && point.value === 26 ? "unranked" : point.value}</title></circle>)}
      </svg>
    </figure>
  );
}
