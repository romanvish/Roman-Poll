import type { AggregatedTeam } from "@/lib/types";

export function ConsensusBadge({ team }: { team: AggregatedTeam }) {
  const labels = { unanimous: "Unanimous", close: "Close", split: "Split" } as const;
  return <span className={`consensus ${team.consensus}`} title={`Ballot rank range: ${team.rankSpread}`}>{labels[team.consensus]}<span className="sr-only">; rank range {team.rankSpread}</span></span>;
}
