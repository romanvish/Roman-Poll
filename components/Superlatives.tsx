import type { TeamProfile, VoterProfile, WeeklySuperlatives } from "@/lib/types";
import { TeamIdentity } from "./TeamIdentity";

export function Superlatives({ items, teams, voters }: { items: WeeklySuperlatives; teams: TeamProfile[]; voters: VoterProfile[] }) {
  const cards = [
    items.strongestConsensus && { label: "Most consensus", team: items.strongestConsensus.team, detail: `${items.strongestConsensus.rankSpread}-spot ballot range` },
    items.mostDivisive && { label: "Most debated", team: items.mostDivisive.team, detail: `${items.mostDivisive.rankSpread}-spot ballot range` },
    items.biggestClimber && { label: "Biggest climber", team: items.biggestClimber.team, detail: items.biggestClimber.movement.kind === "up" ? `Up ${items.biggestClimber.movement.spots} spots` : "" },
    items.boldestBallot && { label: "Boldest ballot", team: items.boldestBallot.team, detail: `${voters.find((voter) => voter.id === items.boldestBallot?.voterId)?.name ?? items.boldestBallot.voterId} · ${Math.abs(items.boldestBallot.delta).toFixed(1)} spots` },
  ].filter(Boolean) as { label: string; team: string; detail: string }[];
  return <section aria-labelledby="superlatives-title"><div className="section-heading-row"><div><p className="eyebrow">By the numbers</p><h2 id="superlatives-title">Weekly superlatives</h2></div></div><div className="superlative-grid">{cards.map((card) => { const team = teams.find((item) => item.name === card.team)!; return <article key={card.label}><p>{card.label}</p><TeamIdentity team={team} /><span>{card.detail}</span></article>; })}</div></section>;
}
