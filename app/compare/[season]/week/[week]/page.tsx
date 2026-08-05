import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompareExplorer } from "@/components/CompareExplorer";
import { EditionPicker } from "@/components/EditionPicker";
import { getEdition, getEditionSummaries, getPollData } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const dynamicParams = false;
type ComparePageProps = { params: Promise<{ season: string; week: string }> };

export function generateStaticParams() {
  return getEditionSummaries().map(({ season, week }) => ({ season: String(season), week: String(week) }));
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const { season, week } = await params;
  return { title: `${season} Week ${week} Voter Comparison`, description: "Compare two Roman Poll ballots team by team." };
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { season, week } = await params;
  const edition = getEdition(Number(season), Number(week));
  if (!edition) notFound();
  const { voters, teams } = getPollData();
  return <div className="page-shell page-stack"><header className="page-heading ballot-heading"><div><p className="eyebrow">Head to head · {formatDate(edition.publishedAt)}</p><h1>Where the ballots disagree.</h1><p className="lede">Put two voters side by side and find the teams separating their Week {edition.week} rankings.</p></div><EditionPicker editions={getEditionSummaries()} current={edition} section="compare" /></header><CompareExplorer edition={edition} profiles={voters} teams={teams} /></div>;
}
