import { describe, expect, it } from "vitest";
import { aggregateWeek, compareWeeks } from "./compute";
import type { TeamRank, WeekFile } from "./types";

const teams = Array.from({ length: 26 }, (_, index) => `Team ${String(index + 1).padStart(2, "0")}`);

function week(number: number, orders: string[][]): WeekFile {
  return {
    season: 2026,
    week: number,
    publishedAt: "2026-09-01",
    editorial: { headline: "Headline", dek: "Dek", analysis: ["Analysis"], highlights: [] },
    voters: orders.map((order, voter) => ({
      voterId: `voter-${voter}`,
      ballot: order.slice(0, 25).map((team, index): TeamRank => ({ rank: index + 1, team, record: "1-0" })),
    })),
  };
}

describe("poll computation", () => {
  it("awards 25-to-1 points and counts first-place votes", () => {
    const result = aggregateWeek(week(1, [teams, teams]));
    expect(result[0]).toMatchObject({ team: "Team 01", points: 50, firstPlaceVotes: 2, ballots: 2 });
    expect(result[24]).toMatchObject({ points: 2, firstPlaceVotes: 0 });
  });

  it("breaks point ties by average rank and then team name", () => {
    const second = [...teams];
    [second[0], second[1]] = [second[1], second[0]];
    const result = aggregateWeek(week(1, [teams, second]));
    expect(result.slice(0, 2).map((team) => team.team)).toEqual(["Team 01", "Team 02"]);
  });

  it("uses neutral movement for the first edition", () => {
    expect(compareWeeks(week(1, [teams])).rankings.every((team) => team.movement.kind === "same")).toBe(true);
  });

  it("identifies risers, fallers, new teams, and dropped teams", () => {
    const next = [teams[1], teams[0], ...teams.slice(2, 24), teams[25]];
    const result = compareWeeks(week(2, [next]), week(1, [teams]));
    expect(result.rankings[0].movement).toEqual({ kind: "up", spots: 1 });
    expect(result.rankings[1].movement).toEqual({ kind: "down", spots: 1 });
    expect(result.rankings[24].movement).toEqual({ kind: "new" });
    expect(result.droppedTeams).toEqual(["Team 25"]);
  });
});
