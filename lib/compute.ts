import type {
  AggregatedTeam,
  Movement,
  PollComparison,
  WeekFile,
} from "./types";
import { pointsForRank } from "./utils";

type TeamTotals = Omit<AggregatedTeam, "currentRank" | "movement">;

function consensusFor(spread: number): AggregatedTeam["consensus"] {
  if (spread === 0) return "unanimous";
  if (spread <= 2) return "close";
  return "split";
}

export function aggregateWeek(week: WeekFile): TeamTotals[] {
  const totals = new Map<
    string,
    { points: number; ballots: number; rankTotal: number; firstPlaceVotes: number; record: string }
  >();

  for (const voter of week.voters) {
    for (const entry of voter.ballot) {
      const current = totals.get(entry.team) ?? {
        points: 0,
        ballots: 0,
        rankTotal: 0,
        firstPlaceVotes: 0,
        record: entry.record,
      };
      current.points += pointsForRank(entry.rank);
      current.ballots += 1;
      current.rankTotal += entry.rank;
      current.firstPlaceVotes += entry.rank === 1 ? 1 : 0;
      current.record = entry.record;
      totals.set(entry.team, current);
    }
  }

  return Array.from(totals, ([team, total]) => {
    const ranks = week.voters.map((voter) => voter.ballot.find((entry) => entry.team === team)?.rank ?? 26);
    const fieldAverage = ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length;
    const spread = Math.max(...ranks) - Math.min(...ranks);
    const variance = ranks.reduce((sum, rank) => sum + (rank - fieldAverage) ** 2, 0) / ranks.length;
    return {
      team,
      points: total.points,
      pointsAvailable: week.voters.length * 25,
      ballots: total.ballots,
      voteShare: total.ballots / week.voters.length,
      firstPlaceVotes: total.firstPlaceVotes,
      averageRank: total.rankTotal / total.ballots,
      rankSpread: spread,
      rankStandardDeviation: Math.sqrt(variance),
      consensus: consensusFor(spread),
      record: total.record,
    };
  }).sort(
    (a, b) =>
      b.points - a.points ||
      a.averageRank - b.averageRank ||
      a.team.localeCompare(b.team),
  );
}

function movementFor(currentRank: number, previousRank: number | undefined): Movement {
  if (previousRank === undefined) return { kind: "new" };
  if (previousRank === currentRank) return { kind: "same" };
  if (previousRank > currentRank) return { kind: "up", spots: previousRank - currentRank };
  return { kind: "down", spots: currentRank - previousRank };
}

export function compareWeeks(current: WeekFile, previous?: WeekFile): PollComparison {
  const currentRanked = aggregateWeek(current).slice(0, 25);
  const previousRanked = previous ? aggregateWeek(previous).slice(0, 25) : [];
  const previousRanks = new Map(previousRanked.map((team, index) => [team.team, index + 1]));
  const currentNames = new Set(currentRanked.map((team) => team.team));

  return {
    rankings: currentRanked.map((team, index) => ({
      ...team,
      currentRank: index + 1,
      movement: previous
        ? movementFor(index + 1, previousRanks.get(team.team))
        : { kind: "same" },
    })),
    droppedTeams: previousRanked
      .filter((team) => !currentNames.has(team.team))
      .map((team) => team.team),
  };
}
