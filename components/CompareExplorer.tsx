"use client";

import { useSyncExternalStore } from "react";
import { getComparisonRows } from "@/lib/insights";
import type { TeamProfile, VoterProfile, WeekFile } from "@/lib/types";
import { TeamIdentity } from "./TeamIdentity";

export function resolveVoterPair(ids: string[], left?: string | null, right?: string | null): [string, string] {
  if (left && right && left !== right && ids.includes(left) && ids.includes(right)) return [left, right];
  return [ids[0] ?? "", ids[1] ?? ids[0] ?? ""];
}

export function CompareExplorer({ edition, profiles, teams }: { edition: WeekFile; profiles: VoterProfile[]; teams: TeamProfile[] }) {
  const ids = edition.voters.map((voter) => voter.voterId);
  const search = useSyncExternalStore(
    (notify) => { window.addEventListener("popstate", notify); return () => window.removeEventListener("popstate", notify); },
    () => window.location.search,
    () => "",
  );
  const params = new URLSearchParams(search);
  const [left, right] = resolveVoterPair(ids, params.get("left"), params.get("right"));
  function selectPair(nextLeft: string, nextRight: string) {
    if (!nextLeft || !nextRight || nextLeft === nextRight) return;
    const url = new URL(window.location.href);
    url.searchParams.set("left", nextLeft);
    url.searchParams.set("right", nextRight);
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  const rows = getComparisonRows(edition, left, right);
  const biggest = [...rows].sort((a, b) => b.gap - a.gap || a.team.localeCompare(b.team))[0];
  const name = (id: string) => profiles.find((profile) => profile.id === id)?.name ?? id;

  if (ids.length < 2) return <div className="empty-panel">At least two ballots are required for a head-to-head comparison.</div>;
  return (
    <div className="compare-explorer">
      <div className="compare-selectors">
        <label><span>First voter</span><select value={left} onChange={(event) => selectPair(event.target.value, right)}>{ids.map((id) => <option key={id} value={id} disabled={id === right}>{name(id)}</option>)}</select></label>
        <span aria-hidden="true">VS</span>
        <label><span>Second voter</span><select value={right} onChange={(event) => selectPair(left, event.target.value)}>{ids.map((id) => <option key={id} value={id} disabled={id === left}>{name(id)}</option>)}</select></label>
      </div>
      {biggest && <div className="disagreement-callout"><p>Biggest disagreement</p><strong>{biggest.team}</strong><span>{biggest.gap} ranking spots apart</span></div>}
      <div className="compare-table-wrap"><table className="compare-table"><thead><tr><th>Poll</th><th>Team</th><th>{name(left)}</th><th>{name(right)}</th><th>Gap</th></tr></thead><tbody>
        {rows.map((row) => { const team = teams.find((item) => item.name === row.team)!; return <tr key={row.team}><td>{row.pollRank ?? "NR"}</td><td><TeamIdentity team={team} compact /></td><td>{row.leftRank === 26 ? "NR" : row.leftRank}</td><td>{row.rightRank === 26 ? "NR" : row.rightRank}</td><td><strong>{row.gap}</strong></td></tr>; })}
      </tbody></table></div>
    </div>
  );
}
