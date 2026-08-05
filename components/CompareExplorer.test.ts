import { describe, expect, it } from "vitest";
import { resolveVoterPair } from "./CompareExplorer";

describe("comparison URL selection", () => {
  const ids = ["jane", "john", "alex"];
  it("keeps two valid distinct selections", () => expect(resolveVoterPair(ids, "alex", "jane")).toEqual(["alex", "jane"]));
  it("falls back for missing, invalid, or duplicate IDs", () => {
    expect(resolveVoterPair(ids, "missing", "jane")).toEqual(["jane", "john"]);
    expect(resolveVoterPair(ids, "jane", "jane")).toEqual(["jane", "john"]);
  });
});
