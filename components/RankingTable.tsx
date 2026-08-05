import type { AggregatedTeam, TeamProfile } from "@/lib/types";
import { ConsensusBadge } from "./ConsensusBadge";
import { MovementBadge } from "./MovementBadge";
import { TeamIdentity } from "./TeamIdentity";

export function RankingTable({ rows, teams }: { rows: AggregatedTeam[]; teams: TeamProfile[] }) {
  if (rows.length === 0) return <div className="empty-panel">No teams were ranked in this edition.</div>;
  return (
    <>
      <div className="ranking-table-wrap">
        <table className="ranking-table">
          <thead><tr><th>Rank</th><th>Team</th><th>Record</th><th>Movement</th><th>Consensus</th><th>Firsts</th><th>Points</th></tr></thead>
          <tbody>{rows.map((team) => (
            <tr key={team.team}>
              <td><span className="rank-number">{team.currentRank}</span></td>
              <td><TeamIdentity team={teams.find((item) => item.name === team.team)!} /></td><td>{team.record}</td><td><MovementBadge movement={team.movement} /></td><td><ConsensusBadge team={team} /></td>
              <td>{team.firstPlaceVotes || "—"}</td><td><strong>{team.points}</strong><small> / {team.pointsAvailable}</small></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="ranking-mobile">
        {rows.map((team) => <article key={team.team}><span className="rank-number">{team.currentRank}</span><div><TeamIdentity team={teams.find((item) => item.name === team.team)!} compact /><p>{team.record} · {team.points} points · {team.firstPlaceVotes} firsts</p></div><MovementBadge movement={team.movement} /></article>)}
      </div>
    </>
  );
}
