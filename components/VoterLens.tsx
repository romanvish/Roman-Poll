import type { TeamProfile, VoterLens as VoterLensType } from "@/lib/types";
import { TeamIdentity } from "./TeamIdentity";

function DeltaList({ items, teams, direction }: { items: VoterLensType["higher"]; teams: TeamProfile[]; direction: "higher" | "lower" }) {
  return (
    <div className={`delta-card ${direction}`}>
      <p>{direction === "higher" ? "Higher than the field" : "Lower than the field"}</p>
      <ol>
        {items.map((item) => {
          const team = teams.find((candidate) => candidate.name === item.team)!;
          return <li key={item.team}><TeamIdentity team={team} compact /><span><strong>{Math.abs(item.delta).toFixed(1)}</strong> spots</span></li>;
        })}
      </ol>
    </div>
  );
}

export function VoterLens({ lens, teams, title }: { lens: VoterLensType; teams: TeamProfile[]; title?: string }) {
  if (!lens.available) return <div className="empty-panel">At least two ballots are required to compare a voter with the field.</div>;
  return (
    <section className="voter-lens" aria-label={title ?? "Voter compared with the field"}>
      {title && <h2>{title}</h2>}
      <div className="delta-grid">
        <DeltaList items={lens.higher} teams={teams} direction="higher" />
        <DeltaList items={lens.lower} teams={teams} direction="lower" />
      </div>
    </section>
  );
}
