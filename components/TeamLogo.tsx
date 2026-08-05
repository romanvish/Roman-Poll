"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { publicAsset } from "@/lib/assets";
import type { TeamProfile } from "@/lib/types";

export function TeamLogo({ team, size = 38, linked = false }: { team: TeamProfile; size?: number; linked?: boolean }) {
  const [failed, setFailed] = useState(team.logoAvailable === false);
  const logo = (
    <span className="team-logo" style={{ width: size, height: size }} aria-hidden="true">
      {!failed
        ? <Image src={publicAsset(team.logo)} alt="" fill sizes={`${size}px`} onError={() => setFailed(true)} />
        : <span>{team.abbreviation}</span>}
    </span>
  );
  return linked ? <Link className="team-logo-link" href={`/teams/${team.id}`} aria-label={`${team.name} team page`}>{logo}</Link> : logo;
}
