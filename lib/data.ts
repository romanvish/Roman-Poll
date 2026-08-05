import { cache } from "react";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import type { EditionSummary, TeamProfile, VoterProfile, WeekFile } from "./types";

const DATA_ROOT = path.join(process.cwd(), "data");

function fail(source: string, message: string): never {
  throw new Error(`${source}: ${message}`);
}

function object(value: unknown, source: string, label = "value"): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(source, `${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, source: string, label: string): string {
  if (typeof value !== "string" || value.trim() === "") fail(source, `${label} must be a non-empty string`);
  return value;
}

function integer(value: unknown, source: string, label: string): number {
  if (!Number.isInteger(value)) fail(source, `${label} must be an integer`);
  return value as number;
}

function array(value: unknown, source: string, label: string): unknown[] {
  if (!Array.isArray(value)) fail(source, `${label} must be an array`);
  return value;
}

export function parseJsonText(content: string, source: string): unknown {
  try {
    return JSON.parse(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown JSON error";
    fail(source, `invalid JSON (${message})`);
  }
}

function readJson(file: string): unknown {
  return parseJsonText(readFileSync(file, "utf8"), path.relative(process.cwd(), file));
}

export function parseVoters(value: unknown, source = "voters.json"): VoterProfile[] {
  const ids = new Set<string>();
  return array(value, source, "voters").map((raw, index) => {
    const voter = object(raw, source, `voters[${index}]`);
    const id = text(voter.id, source, `voters[${index}].id`);
    if (ids.has(id)) fail(source, `duplicate voter id “${id}”`);
    ids.add(id);
    const rawBio = voter.bio;
    const bio = typeof rawBio === "string"
      ? [rawBio]
      : array(rawBio ?? [], source, `voters[${index}].bio`).map((item, bioIndex) => text(item, source, `voters[${index}].bio[${bioIndex}]`));
    const specialties = array(voter.specialties ?? [], source, `voters[${index}].specialties`).map((item, specialtyIndex) => text(item, source, `voters[${index}].specialties[${specialtyIndex}]`));
    const links = array(voter.links ?? [], source, `voters[${index}].links`).map((rawLink, linkIndex) => {
      const link = object(rawLink, source, `voters[${index}].links[${linkIndex}]`);
      return { label: text(link.label, source, `voters[${index}].links[${linkIndex}].label`), url: text(link.url, source, `voters[${index}].links[${linkIndex}].url`) };
    });
    const photo = typeof voter.photo === "string" ? voter.photo : undefined;
    if (photo && !/^\/voters\/[a-z0-9-]+\.(?:jpe?g|png|webp)$/i.test(photo)) fail(source, `unsafe or unsupported photo path “${photo}”`);
    return {
      id,
      name: text(voter.name, source, `voters[${index}].name`),
      ...(typeof voter.title === "string" ? { title: voter.title } : {}),
      ...(typeof voter.affiliation === "string" ? { affiliation: voter.affiliation } : {}),
      ...(photo ? { photo } : {}),
      ...(typeof voter.location === "string" ? { location: voter.location } : {}),
      specialties,
      bio,
      links,
    };
  });
}

export function parseTeams(value: unknown, source = "teams.json"): TeamProfile[] {
  const ids = new Set<string>();
  const names = new Set<string>();
  return array(value, source, "teams").map((raw, index) => {
    const team = object(raw, source, `teams[${index}]`);
    const id = text(team.id, source, `teams[${index}].id`);
    const name = text(team.name, source, `teams[${index}].name`);
    const logo = text(team.logo, source, `teams[${index}].logo`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) fail(source, `team id “${id}” must be a URL-safe slug`);
    if (ids.has(id)) fail(source, `duplicate team id “${id}”`);
    if (names.has(name)) fail(source, `duplicate team name “${name}”`);
    if (!/^\/team-logos\/[a-z0-9-]+\.(?:svg|png|webp)$/i.test(logo)) fail(source, `unsafe or unsupported logo path “${logo}”`);
    ids.add(id);
    names.add(name);
    return { id, name, abbreviation: text(team.abbreviation, source, `teams[${index}].abbreviation`), logo };
  });
}

export function validateTeamCoverage(weeks: WeekFile[], teams: TeamProfile[]): void {
  const teamNames = new Set(teams.map((team) => team.name));
  for (const week of weeks) {
    for (const entry of week.voters.flatMap((voter) => voter.ballot)) {
      if (!teamNames.has(entry.team)) fail(`data/${week.season}/Week${week.week}.json`, `unknown team “${entry.team}”; add it to data/teams.json`);
    }
  }
}

export function parseWeek(
  value: unknown,
  expected: { season: number; week: number },
  voterIds: Set<string>,
  source = "week.json",
): WeekFile {
  const root = object(value, source);
  const season = integer(root.season, source, "season");
  const week = integer(root.week, source, "week");
  if (season !== expected.season) fail(source, `season ${season} does not match folder ${expected.season}`);
  if (week !== expected.week) fail(source, `week ${week} does not match filename Week${expected.week}.json`);

  const editorial = object(root.editorial, source, "editorial");
  const analysis = array(editorial.analysis, source, "editorial.analysis").map((item, index) =>
    text(item, source, `editorial.analysis[${index}]`),
  );
  const highlights = array(editorial.highlights, source, "editorial.highlights").map((raw, index) => {
    const highlight = object(raw, source, `editorial.highlights[${index}]`);
    return {
      label: text(highlight.label, source, `editorial.highlights[${index}].label`),
      title: text(highlight.title, source, `editorial.highlights[${index}].title`),
      body: text(highlight.body, source, `editorial.highlights[${index}].body`),
    };
  });

  const seenVoters = new Set<string>();
  const records = new Map<string, string>();
  const voters = array(root.voters, source, "voters").map((raw, voterIndex) => {
    const voter = object(raw, source, `voters[${voterIndex}]`);
    const voterId = text(voter.voterId, source, `voters[${voterIndex}].voterId`);
    if (!voterIds.has(voterId)) fail(source, `unknown voter “${voterId}”`);
    if (seenVoters.has(voterId)) fail(source, `duplicate ballot for voter “${voterId}”`);
    seenVoters.add(voterId);

    const ranks = new Set<number>();
    const teams = new Set<string>();
    const ballot = array(voter.ballot, source, `${voterId}.ballot`).map((rawRank, rankIndex) => {
      const entry = object(rawRank, source, `${voterId}.ballot[${rankIndex}]`);
      const rank = integer(entry.rank, source, `${voterId}.ballot[${rankIndex}].rank`);
      const team = text(entry.team, source, `${voterId}.ballot[${rankIndex}].team`);
      const record = text(entry.record, source, `${voterId}.ballot[${rankIndex}].record`);
      if (rank < 1 || rank > 25) fail(source, `${voterId} has rank ${rank}; expected 1–25`);
      if (ranks.has(rank)) fail(source, `${voterId} has duplicate rank ${rank}`);
      if (teams.has(team)) fail(source, `${voterId} ranks “${team}” more than once`);
      ranks.add(rank);
      teams.add(team);
      const knownRecord = records.get(team);
      if (knownRecord && knownRecord !== record) fail(source, `conflicting records for “${team}”`);
      records.set(team, record);
      return { rank, team, record };
    });
    if (ballot.length !== 25) fail(source, `${voterId} has ${ballot.length} rankings; expected 25`);
    ballot.sort((a, b) => a.rank - b.rank);
    return { voterId, ballot };
  });
  if (voters.length === 0) fail(source, "must contain at least one voter ballot");

  return {
    season,
    week,
    publishedAt: text(root.publishedAt, source, "publishedAt"),
    editorial: {
      headline: text(editorial.headline, source, "editorial.headline"),
      dek: text(editorial.dek, source, "editorial.dek"),
      analysis,
      highlights,
    },
    voters,
  };
}

function loadAll() {
  const voterFile = path.join(DATA_ROOT, "voters.json");
  const voters = parseVoters(readJson(voterFile), "data/voters.json").map((voter) => ({
    ...voter,
    photoAvailable: Boolean(voter.photo && existsSync(path.join(process.cwd(), "public", voter.photo.slice(1)))),
  }));
  const teams = parseTeams(readJson(path.join(DATA_ROOT, "teams.json")), "data/teams.json").map((team) => ({
    ...team,
    logoAvailable: existsSync(path.join(process.cwd(), "public", team.logo.slice(1))),
  }));
  const voterIds = new Set(voters.map((voter) => voter.id));
  const weeks: WeekFile[] = [];

  for (const seasonEntry of readdirSync(DATA_ROOT, { withFileTypes: true })) {
    if (!seasonEntry.isDirectory() || !/^\d{4}$/.test(seasonEntry.name)) continue;
    const season = Number(seasonEntry.name);
    const directory = path.join(DATA_ROOT, seasonEntry.name);
    for (const filename of readdirSync(directory)) {
      const match = filename.match(/^Week(\d+)\.json$/);
      if (!match) continue;
      const week = Number(match[1]);
      const file = path.join(directory, filename);
      weeks.push(parseWeek(readJson(file), { season, week }, voterIds, `data/${season}/${filename}`));
    }
  }
  weeks.sort((a, b) => a.season - b.season || a.week - b.week);
  if (weeks.length === 0) fail("data", "no WeekN.json editions were found");
  validateTeamCoverage(weeks, teams);
  return { voters, teams, weeks };
}

export const getPollData = cache(loadAll);

export function getEditionSummaries(): EditionSummary[] {
  return getPollData().weeks.map((week) => ({
    season: week.season,
    week: week.week,
    publishedAt: week.publishedAt,
    headline: week.editorial.headline,
  }));
}

export function getEdition(season: number, week: number): WeekFile | undefined {
  return getPollData().weeks.find((edition) => edition.season === season && edition.week === week);
}

export function getPreviousEdition(season: number, week: number): WeekFile | undefined {
  return [...getPollData().weeks]
    .reverse()
    .find((edition) => edition.season === season && edition.week < week);
}

export function getLatestEdition(): WeekFile {
  return getPollData().weeks.at(-1)!;
}

export function getTeamByName(name: string): TeamProfile | undefined {
  return getPollData().teams.find((team) => team.name === name);
}

export function getTeamById(id: string): TeamProfile | undefined {
  return getPollData().teams.find((team) => team.id === id);
}

export function getVoterById(id: string): VoterProfile | undefined {
  return getPollData().voters.find((voter) => voter.id === id);
}
