import Link from "next/link";
import type { TeamProfile } from "@/lib/types";
import { TeamLogo } from "./TeamLogo";

export function TeamIdentity({ team, compact = false }: { team: TeamProfile; compact?: boolean }) {
  return (
    <span className={`team-identity${compact ? " team-identity-compact" : ""}`}>
      <TeamLogo team={team} size={compact ? 30 : 38} linked />
      <Link href={`/teams/${team.id}`}><strong>{team.name}</strong></Link>
    </span>
  );
}
