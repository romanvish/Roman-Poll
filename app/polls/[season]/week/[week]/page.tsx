import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PollEdition } from "@/components/PollEdition";
import { getEdition, getEditionSummaries, getPreviousEdition } from "@/lib/data";

export const dynamicParams = false;

type PollPageProps = { params: Promise<{ season: string; week: string }> };

export function generateStaticParams() {
  return getEditionSummaries().map(({ season, week }) => ({ season: String(season), week: String(week) }));
}

export async function generateMetadata({ params }: PollPageProps): Promise<Metadata> {
  const { season, week } = await params;
  const edition = getEdition(Number(season), Number(week));
  return edition
    ? { title: `${season} Week ${week} Top 25`, description: edition.editorial.dek }
    : { title: "Edition not found" };
}

export default async function PollPage({ params }: PollPageProps) {
  const { season, week } = await params;
  const edition = getEdition(Number(season), Number(week));
  if (!edition) notFound();
  return (
    <PollEdition
      edition={edition}
      previous={getPreviousEdition(edition.season, edition.week)}
      editions={getEditionSummaries()}
    />
  );
}
