import { describe, expect, it } from "vitest";
import { filterBallots } from "./BallotExplorer";
import type { VoterBallot, VoterProfile } from "@/lib/types";

const ballots = [
  { voterId: "jane", ballot: [{ rank: 1, team: "Georgia", record: "1-0" }] },
  { voterId: "john", ballot: [{ rank: 1, team: "Oregon", record: "1-0" }] },
] satisfies VoterBallot[];
const profiles = [
  { id: "jane", name: "Jane Doe", affiliation: "Gridiron Weekly", specialties: [], bio: [], links: [] },
  { id: "john", name: "John Smith", affiliation: "College Metrics", specialties: [], bio: [], links: [] },
] satisfies VoterProfile[];

describe("ballot filtering", () => {
  it("matches voter identity, affiliation, and teams without case sensitivity", () => {
    expect(filterBallots(ballots, profiles, "JANE")).toHaveLength(1);
    expect(filterBallots(ballots, profiles, "metrics")[0].voterId).toBe("john");
    expect(filterBallots(ballots, profiles, "geo")[0].voterId).toBe("jane");
  });

  it("returns every ballot for a blank query", () => {
    expect(filterBallots(ballots, profiles, "  ")).toBe(ballots);
  });
});
