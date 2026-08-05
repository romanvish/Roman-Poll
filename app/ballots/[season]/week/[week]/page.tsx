import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { BallotExplorer } from "@/components/BallotExplorer";
import { EditionPicker } from "@/components/EditionPicker";
import { getEdition, getEditionSummaries, getPollData } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const dynamicParams = false;

type BallotsPageProps = { params: Promise<{ season: string; week: string }> };

export function generateStaticParams() {
  return getEditionSummaries().map(({ season, week }) => ({ season: String(season), week: String(week) }));
}

export async function generateMetadata({ params }: BallotsPageProps): Promise<Metadata> {
  const { season, week } = await params;
  return { title: `${season} Week ${week} Ballots`, description: "Explore every ballot behind this Roman Poll edition." };
}

export default async function BallotsPage({ params }: BallotsPageProps) {
  const { season, week } = await params;
  const edition = getEdition(Number(season), Number(week));
  if (!edition) notFound();
  const { voters: profiles, teams } = getPollData();

  return (
    <div className="page-shell page-stack">
      <header className="page-heading ballot-heading">
        <div>
          <p className="eyebrow">The ballots · {formatDate(edition.publishedAt)}</p>
          <h1>Every vote, out in the open.</h1>
          <p className="lede">See exactly how each voter ranked the field for Week {edition.week} of the {edition.season} season.</p>
        </div>
        <EditionPicker editions={getEditionSummaries()} current={edition} section="ballots" />
      </header>

      <section className="voter-strip" aria-label="Participating voters">
        {edition.voters.map(({ voterId }) => {
          const profile = profiles.find((item) => item.id === voterId)!;
          return <Avatar key={voterId} profile={profile} compact linked />;
        })}
      </section>

      <BallotExplorer ballots={edition.voters} profiles={profiles} teams={teams} />
    </div>
  );
}
