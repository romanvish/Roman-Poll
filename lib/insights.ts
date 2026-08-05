import { aggregateWeek, compareWeeks } from "./compute";
import type {
  ComparisonRow,
  TeamSeasonHistory,
  VoterLens,
  VoterTeamDelta,
  WeekFile,
  WeeklySuperlatives,
} from "./types";

const UNRANKED = 26;

export function getVoterDeltas(week: WeekFile, voterId: string): VoterTeamDelta[] {
  const voter = week.voters.find((ballot) => ballot.voterId === voterId);
  const field = week.voters.filter((ballot) => ballot.voterId !== voterId);
  if (!voter || field.length === 0) return [];

  const teams = new Set(week.voters.flatMap((ballot) => ballot.ballot.map((entry) => entry.team)));
  const voterRanks = new Map(voter.ballot.map((entry) => [entry.team, entry.rank]));
  return Array.from(teams, (team) => {
    const voterRank = voterRanks.get(team) ?? UNRANKED;
    const fieldAverageRank = field.reduce(
      (sum, ballot) => sum + (ballot.ballot.find((entry) => entry.team === team)?.rank ?? UNRANKED),
      0,
    ) / field.length;
    return { team, voterRank, fieldAverageRank, delta: fieldAverageRank - voterRank };
  }).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || a.team.localeCompare(b.team));
}

export function getVoterLens(week: WeekFile, voterId: string, limit = 3): VoterLens {
  const deltas = getVoterDeltas(week, voterId);
  return {
    available: deltas.length > 0,
    higher: deltas.filter((item) => item.delta > 0).slice(0, limit),
    lower: deltas.filter((item) => item.delta < 0).slice(0, limit),
  };
}

export function getSeasonVoterLens(weeks: WeekFile[], voterId: string, limit = 3): VoterLens {
  const grouped = new Map<string, { delta: number; voterRank: number; fieldRank: number; count: number }>();
  for (const week of weeks) {
    for (const item of getVoterDeltas(week, voterId)) {
      const current = grouped.get(item.team) ?? { delta: 0, voterRank: 0, fieldRank: 0, count: 0 };
      current.delta += item.delta;
      current.voterRank += item.voterRank;
      current.fieldRank += item.fieldAverageRank;
      current.count += 1;
      grouped.set(item.team, current);
    }
  }
  const deltas = Array.from(grouped, ([team, item]) => ({
    team,
    voterRank: item.voterRank / item.count,
    fieldAverageRank: item.fieldRank / item.count,
    delta: item.delta / item.count,
  })).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || a.team.localeCompare(b.team));
  return {
    available: deltas.length > 0,
    higher: deltas.filter((item) => item.delta > 0).slice(0, limit),
    lower: deltas.filter((item) => item.delta < 0).slice(0, limit),
  };
}

export function getWeeklySuperlatives(week: WeekFile, previous?: WeekFile): WeeklySuperlatives {
  const rankings = compareWeeks(week, previous).rankings;
  const byConsensus = [...rankings].sort(
    (a, b) => a.rankStandardDeviation - b.rankStandardDeviation || a.currentRank - b.currentRank,
  );
  const byDivision = [...rankings].sort(
    (a, b) => b.rankStandardDeviation - a.rankStandardDeviation || a.currentRank - b.currentRank,
  );
  const climbers = rankings
    .filter((team) => team.movement.kind === "up")
    .sort((a, b) => {
      const aSpots = a.movement.kind === "up" ? a.movement.spots : 0;
      const bSpots = b.movement.kind === "up" ? b.movement.spots : 0;
      return bSpots - aSpots || a.currentRank - b.currentRank;
    });
  const bold = week.voters.flatMap((voter) =>
    getVoterDeltas(week, voter.voterId).map((item) => ({ ...item, voterId: voter.voterId })),
  ).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || a.voterId.localeCompare(b.voterId) || a.team.localeCompare(b.team));
  return {
    strongestConsensus: byConsensus[0],
    mostDivisive: byDivision[0],
    biggestClimber: climbers[0],
    boldestBallot: bold[0],
  };
}

export function getTeamHistory(weeks: WeekFile[], teamName: string): TeamSeasonHistory[] {
  const bySeason = new Map<number, WeekFile[]>();
  for (const week of weeks) {
    const season = bySeason.get(week.season) ?? [];
    season.push(week);
    bySeason.set(week.season, season);
  }
  return Array.from(bySeason, ([season, seasonWeeks]) => {
    seasonWeeks.sort((a, b) => a.week - b.week);
    const points = seasonWeeks.map((week) => {
      const aggregated = aggregateWeek(week);
      const index = aggregated.findIndex((team) => team.team === teamName);
      const team = index >= 0 ? aggregated[index] : undefined;
      return {
        season,
        week: week.week,
        publishedAt: week.publishedAt,
        rank: index >= 0 && index < 25 ? index + 1 : null,
        points: team?.points ?? 0,
        record: team?.record ?? null,
      };
    });
    const ranked = points.flatMap((point) => point.rank === null ? [] : [point.rank]);
    const latest = points.at(-1)!;
    return {
      season,
      currentRank: latest.rank,
      seasonHigh: ranked.length ? Math.min(...ranked) : null,
      weeksRanked: ranked.length,
      latestRecord: latest.record,
      points,
    };
  }).sort((a, b) => b.season - a.season);
}

export function getComparisonRows(week: WeekFile, leftId: string, rightId: string): ComparisonRow[] {
  const left = week.voters.find((voter) => voter.voterId === leftId);
  const right = week.voters.find((voter) => voter.voterId === rightId);
  if (!left || !right || leftId === rightId) return [];
  const leftRanks = new Map(left.ballot.map((entry) => [entry.team, entry.rank]));
  const rightRanks = new Map(right.ballot.map((entry) => [entry.team, entry.rank]));
  const official = new Map(aggregateWeek(week).slice(0, 25).map((team, index) => [team.team, index + 1]));
  const teams = new Set([...leftRanks.keys(), ...rightRanks.keys()]);
  return Array.from(teams, (team) => {
    const leftRank = leftRanks.get(team) ?? UNRANKED;
    const rightRank = rightRanks.get(team) ?? UNRANKED;
    return { team, leftRank, rightRank, pollRank: official.get(team) ?? null, gap: Math.abs(leftRank - rightRank) };
  }).sort((a, b) => (a.pollRank ?? UNRANKED) - (b.pollRank ?? UNRANKED) || b.gap - a.gap || a.team.localeCompare(b.team));
}
