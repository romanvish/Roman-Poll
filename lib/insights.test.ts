import { describe, expect, it } from "vitest";
import { getComparisonRows, getSeasonVoterLens, getTeamHistory, getVoterDeltas, getVoterLens, getWeeklySuperlatives } from "./insights";
import type { WeekFile } from "./types";

const names = Array.from({ length: 26 }, (_, index) => `Team ${String(index + 1).padStart(2, "0")}`);
function makeWeek(week: number, orders: string[][]): WeekFile {
  return { season: 2026, week, publishedAt: `2026-09-${String(week).padStart(2, "0")}`, editorial: { headline: "H", dek: "D", analysis: ["A"], highlights: [] }, voters: orders.map((order, index) => ({ voterId: `v${index + 1}`, ballot: order.slice(0, 25).map((team, rank) => ({ rank: rank + 1, team, record: `${week}-0` })) })) };
}

describe("viewer insights", () => {
  const swapped = [names[1], names[0], ...names.slice(2, 24), names[25]];
  const first = makeWeek(1, [names, swapped]);

  it("calculates leave-one-out deltas and treats omissions as rank 26", () => {
    const deltas = getVoterDeltas(first, "v1");
    expect(deltas.find((item) => item.team === "Team 01")?.delta).toBe(1);
    expect(deltas.find((item) => item.team === "Team 25")?.fieldAverageRank).toBe(26);
    expect(deltas.find((item) => item.team === "Team 26")?.voterRank).toBe(26);
    expect(getVoterLens(first, "v1").available).toBe(true);
  });

  it("returns an unavailable lens when there is no comparison field", () => {
    expect(getVoterLens(makeWeek(1, [names]), "v1")).toEqual({ available: false, higher: [], lower: [] });
  });

  it("aggregates season tendencies deterministically", () => {
    const lens = getSeasonVoterLens([first, makeWeek(2, [names, swapped])], "v1");
    expect(lens.higher[0].team).toBe("Team 01");
  });

  it("computes comparison gaps and rejects invalid pairs", () => {
    expect(getComparisonRows(first, "v1", "v2")[0].pollRank).toBe(1);
    expect(getComparisonRows(first, "v1", "v1")).toEqual([]);
  });

  it("builds rank and points history including unranked weeks", () => {
    const history = getTeamHistory([first, makeWeek(2, [swapped, swapped])], "Team 25")[0];
    expect(history.points).toHaveLength(2);
    expect(history.points[1].rank).toBeNull();
    expect(history.seasonHigh).toBe(25);
  });

  it("selects deterministic weekly superlatives", () => {
    const items = getWeeklySuperlatives(first);
    expect(items.strongestConsensus?.team).toBe("Team 03");
    expect(items.mostDivisive?.rankSpread).toBeGreaterThan(0);
    expect(items.boldestBallot).toBeDefined();
  });
});
