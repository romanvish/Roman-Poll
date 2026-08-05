import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProfilePortrait } from "@/components/ProfilePortrait";
import { TeamIdentity } from "@/components/TeamIdentity";
import { VoterLens } from "@/components/VoterLens";
import { getPollData, getVoterById } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { getSeasonVoterLens, getVoterLens } from "@/lib/insights";

export const dynamicParams = false;
type VoterPageProps = { params: Promise<{ id: string }> };

export function generateStaticParams() { return getPollData().voters.map((voter) => ({ id: voter.id })); }
export async function generateMetadata({ params }: VoterPageProps): Promise<Metadata> {
  const voter = getVoterById((await params).id);
  return voter ? { title: voter.name, description: voter.bio[0] ?? `${voter.name}, Roman Poll voter.` } : { title: "Voter not found" };
}

export default async function VoterPage({ params }: VoterPageProps) {
  const voter = getVoterById((await params).id);
  if (!voter) notFound();
  const { weeks, teams } = getPollData();
  const editions = weeks.filter((week) => week.voters.some((ballot) => ballot.voterId === voter.id));
  const latest = editions.at(-1);
  const ballot = latest?.voters.find((item) => item.voterId === voter.id);
  return <div className="page-shell page-stack voter-profile-page">
    <header className="voter-profile-hero"><ProfilePortrait profile={voter} /><div><p className="eyebrow">Roman Poll voter</p><h1>{voter.name}</h1><p className="voter-role">{[voter.title, voter.affiliation].filter(Boolean).join(" · ")}</p>{voter.location && <p className="voter-location">{voter.location}</p>}<div className="specialty-list">{voter.specialties.map((item) => <span key={item}>{item}</span>)}</div></div></header>
    <section className="profile-bio"><div className="section-intro"><p className="section-number">01</p><h2>About {voter.name.split(" ")[0]}</h2></div><div>{voter.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<div className="profile-links">{voter.links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label} <span aria-hidden="true">↗</span></a>)}</div></div></section>
    {latest && <VoterLens lens={getVoterLens(latest, voter.id)} teams={teams} title={`Week ${latest.week}: against the field`} />}
    {latest && <VoterLens lens={getSeasonVoterLens(editions.filter((week) => week.season === latest.season), voter.id)} teams={teams} title={`${latest.season} signature takes`} />}
    {latest && ballot && <section><div className="section-heading-row"><div><p className="eyebrow">Latest ballot · {formatDate(latest.publishedAt)}</p><h2>Week {latest.week} ranking</h2></div><Link className="text-link" href={`/ballots/${latest.season}/week/${latest.week}`}>See every ballot →</Link></div><ol className="profile-ballot">{ballot.ballot.map((entry) => <li key={entry.rank}><span>{entry.rank}</span><TeamIdentity team={teams.find((team) => team.name === entry.team)!} /><small>{entry.record}</small></li>)}</ol></section>}
    <section><div className="section-heading-row"><div><p className="eyebrow">Archive</p><h2>Published ballots</h2></div></div><div className="edition-link-grid">{[...editions].reverse().map((edition) => <Link key={`${edition.season}-${edition.week}`} href={`/ballots/${edition.season}/week/${edition.week}`}><strong>{edition.season} · Week {edition.week}</strong><span>{formatDate(edition.publishedAt)} →</span></Link>)}</div></section>
  </div>;
}
