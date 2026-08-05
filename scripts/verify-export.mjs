import { access, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const teams = JSON.parse(await readFile(join(root, "data", "teams.json"), "utf8"));
const voters = JSON.parse(await readFile(join(root, "data", "voters.json"), "utf8"));
const seasons = (await readdir(join(root, "data"), { withFileTypes: true })).filter((entry) => entry.isDirectory() && /^\d{4}$/.test(entry.name));
const editions = [];
for (const season of seasons) {
  for (const file of await readdir(join(root, "data", season.name))) {
    const match = file.match(/^Week(\d+)\.json$/);
    if (match) editions.push({ season: season.name, week: match[1] });
  }
}

const expected = [
  "index.html", "404.html", "about/index.html",
  ...editions.flatMap(({ season, week }) => [
    `polls/${season}/week/${week}/index.html`,
    `ballots/${season}/week/${week}/index.html`,
    `compare/${season}/week/${week}/index.html`,
  ]),
  ...teams.map((team) => `teams/${team.id}/index.html`),
  ...voters.map((voter) => `voters/${voter.id}/index.html`),
];

await Promise.all(expected.map((file) => access(join(root, "out", file))));
const home = await readFile(join(root, "out", "index.html"), "utf8");
const prefix = process.env.GITHUB_ACTIONS === "true" ? "/Roman-Poll" : "";
if (!home.includes(`${prefix}/teams/georgia`)) throw new Error("Exported homepage is missing a base-path-safe team link");
let suppliedLogo;
for (const team of teams) {
  try { await access(join(root, "public", team.logo.slice(1))); suppliedLogo = team; break; } catch { /* Optional assets use abbreviations. */ }
}
if (suppliedLogo && !home.includes(`${prefix}${suppliedLogo.logo}`)) throw new Error("Exported homepage is missing a base-path-safe team logo URL");
if (!suppliedLogo && !home.includes("UGA")) throw new Error("Exported homepage is missing the logo abbreviation fallback");
console.log(`Verified ${expected.length} exported routes, team links, and ${suppliedLogo ? "image URLs" : "image fallbacks"}.`);
