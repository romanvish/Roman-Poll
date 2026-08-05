"use client";

import { useMemo, useState } from "react";
import type { TeamProfile, VoterBallot, VoterProfile } from "@/lib/types";
import { Avatar } from "./Avatar";
import { TeamIdentity } from "./TeamIdentity";

export function filterBallots(ballots: VoterBallot[], profiles: VoterProfile[], query: string): VoterBallot[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return ballots;
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  return ballots.filter((ballot) => {
    const profile = profilesById.get(ballot.voterId);
    const identity = [profile?.name, profile?.title, profile?.affiliation].filter(Boolean).join(" ").toLocaleLowerCase();
    return identity.includes(needle) || ballot.ballot.some((entry) => entry.team.toLocaleLowerCase().includes(needle));
  });
}

export function BallotExplorer({ ballots, profiles, teams }: { ballots: VoterBallot[]; profiles: VoterProfile[]; teams: TeamProfile[] }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => filterBallots(ballots, profiles, query), [ballots, profiles, query]);
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  return (
    <section aria-labelledby="ballot-list-title">
      <div className="ballot-tools">
        <div><p className="eyebrow">Ballot room</p><h2 id="ballot-list-title">Individual rankings</h2></div>
        <label className="search-box"><span className="sr-only">Search voters or teams</span><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search voter or team" /></label>
      </div>
      <p className="result-count" aria-live="polite">Showing {visible.length} of {ballots.length} ballots</p>
      <div className="ballot-list">
        {visible.map((ballot) => {
          const profile = profilesById.get(ballot.voterId)!;
          return (
            <details key={ballot.voterId} className="ballot-card" open>
              <summary><Avatar profile={profile} compact linked /><span className="ballot-toggle">View ballot <span aria-hidden="true">＋</span></span></summary>
              <ol className="ballot-body">{ballot.ballot.map((entry) => <li key={entry.rank}><span>{entry.rank}</span><TeamIdentity team={teams.find((team) => team.name === entry.team)!} compact /><small>{entry.record}</small></li>)}</ol>
            </details>
          );
        })}
        {visible.length === 0 && <div className="empty-panel"><strong>No ballots match “{query}”.</strong><p>Try a voter name, affiliation, or team.</p></div>}
      </div>
    </section>
  );
}
