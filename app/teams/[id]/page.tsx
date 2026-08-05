import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeamHistory } from "@/components/TeamHistory";
import { TeamLogo } from "@/components/TeamLogo";
import { getPollData, getTeamById } from "@/lib/data";
import { getTeamHistory } from "@/lib/insights";

export const dynamicParams = false;
type TeamPageProps = { params: Promise<{ id: string }> };
export function generateStaticParams() { return getPollData().teams.map((team) => ({ id: team.id })); }
export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> { const team = getTeamById((await params).id); return team ? { title: team.name, description: `${team.name} ranking history in Roman Poll.` } : { title: "Team not found" }; }

export default async function TeamPage({ params }: TeamPageProps) {
  const team = getTeamById((await params).id);
  if (!team) notFound();
  const history = getTeamHistory(getPollData().weeks, team.name);
  const latest = history[0];
  return <div className="page-shell page-stack team-page"><header className="team-hero"><TeamLogo team={team} size={128} /><div><p className="eyebrow">Team history</p><h1>{team.name}</h1><p>{latest?.currentRank ? `Currently No. ${latest.currentRank}` : "Currently unranked"} · {latest?.latestRecord ?? "No record"}</p></div></header>{latest && <section className="stat-grid team-stats"><div><span>{latest.currentRank ?? "NR"}</span><p>Current rank</p></div><div><span>{latest.seasonHigh ?? "NR"}</span><p>Season high</p></div><div><span>{latest.weeksRanked}</span><p>Weeks ranked</p></div><div><span>{latest.latestRecord ?? "—"}</span><p>Latest record</p></div></section>}{history.map((season) => <TeamHistory key={season.season} history={season} />)}</div>;
}
