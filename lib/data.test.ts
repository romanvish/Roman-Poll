import { describe, expect, it } from "vitest";
import { parseJsonText, parseTeams, parseVoters, parseWeek, validateTeamCoverage } from "./data";
const ballot = Array.from({ length: 25 }, (_, index) => ({ rank: index + 1, team: `Team ${index + 1}`, record: "1-0" }));
const valid = {
  season: 2026,
  week: 1,
  publishedAt: "2026-09-01",
  editorial: { headline: "Headline", dek: "Dek", analysis: ["Analysis"], highlights: [] },
  voters: [{ voterId: "voter", ballot }],
};

describe("poll data validation", () => {
  it("accepts a complete edition", () => {
    expect(parseWeek(valid, { season: 2026, week: 1 }, new Set(["voter"]))).toMatchObject({ season: 2026, week: 1 });
  });

  it("reports malformed JSON with its source", () => {
    expect(() => parseJsonText("{", "broken.json")).toThrow(/broken\.json: invalid JSON/);
  });

  it("rejects folder and payload mismatches", () => {
    expect(() => parseWeek(valid, { season: 2025, week: 1 }, new Set(["voter"]), "Week1.json")).toThrow(/does not match folder/);
  });

  it("rejects incomplete, duplicate, and unknown-voter ballots", () => {
    expect(() => parseWeek({ ...valid, voters: [{ voterId: "voter", ballot: ballot.slice(0, 24) }] }, { season: 2026, week: 1 }, new Set(["voter"]))).toThrow(/expected 25/);
    expect(() => parseWeek({ ...valid, voters: [{ voterId: "voter", ballot: [...ballot.slice(0, 24), ballot[0]] }] }, { season: 2026, week: 1 }, new Set(["voter"]))).toThrow(/duplicate rank/);
    expect(() => parseWeek({ ...valid, voters: [{ voterId: "missing", ballot }] }, { season: 2026, week: 1 }, new Set(["voter"]))).toThrow(/unknown voter/);
  });

  it("rejects duplicate voter profiles", () => {
    expect(() => parseVoters([{ id: "same", name: "One" }, { id: "same", name: "Two" }])).toThrow(/duplicate voter id/);
    expect(() => parseVoters([{ id: "unsafe", name: "Unsafe", photo: "../private.jpg" }])).toThrow(/unsafe or unsupported photo/);
  });

  it("validates team IDs, unique names, and safe logo paths", () => {
    const team = { id: "team-1", name: "Team 1", abbreviation: "T1", logo: "/team-logos/team-1.svg" };
    expect(parseTeams([team])).toHaveLength(1);
    expect(() => parseTeams([team, { ...team, id: "team-2" }])).toThrow(/duplicate team name/);
    expect(() => parseTeams([{ ...team, logo: "..\/private.svg" }])).toThrow(/unsafe or unsupported/);
  });

  it("requires registry coverage but does not require logo files to exist", () => {
    const parsed = parseWeek(valid, { season: 2026, week: 1 }, new Set(["voter"]));
    const teams = ballot.map((entry) => ({ id: `team-${entry.rank}`, name: entry.team, abbreviation: `T${entry.rank}`, logo: `/team-logos/team-${entry.rank}.svg` }));
    expect(() => validateTeamCoverage([parsed], teams)).not.toThrow();
    expect(() => validateTeamCoverage([parsed], teams.slice(1))).toThrow(/unknown team/);
  });
});
