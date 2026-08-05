import { PollEdition } from "@/components/PollEdition";
import { getEditionSummaries, getLatestEdition, getPreviousEdition } from "@/lib/data";

export default function HomePage() {
  const edition = getLatestEdition();
  return (
    <PollEdition
      edition={edition}
      previous={getPreviousEdition(edition.season, edition.week)}
      editions={getEditionSummaries()}
      isHome
    />
  );
}
