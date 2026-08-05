import { getPollData } from "../lib/data";

const { voters, teams, weeks } = getPollData();
console.log(`Validated ${weeks.length} editions, ${voters.length} voter profiles, and ${teams.length} teams.`);
