import type { TeamSeasonHistory } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Sparkline } from "./Sparkline";

export function TeamHistory({ history }: { history: TeamSeasonHistory }) {
  return (
    <section className="team-history" aria-labelledby={`history-${history.season}`}>
      <div className="section-heading-row"><div><p className="eyebrow">Season archive</p><h2 id={`history-${history.season}`}>{history.season} trajectory</h2></div><p>{history.weeksRanked} weeks ranked · Season high {history.seasonHigh ? `No. ${history.seasonHigh}` : "NR"}</p></div>
      <div className="chart-grid-layout"><Sparkline points={history.points} metric="rank" label="Top 25 rank by week" /><Sparkline points={history.points} metric="points" label="Poll points by week" /></div>
      <div className="history-table-wrap"><table className="history-table"><thead><tr><th>Edition</th><th>Date</th><th>Rank</th><th>Record</th><th>Points</th></tr></thead><tbody>{history.points.map((point) => <tr key={point.week}><td>Week {point.week}</td><td>{formatDate(point.publishedAt)}</td><td>{point.rank ? `No. ${point.rank}` : "NR"}</td><td>{point.record ?? "—"}</td><td>{point.points}</td></tr>)}</tbody></table></div>
    </section>
  );
}
