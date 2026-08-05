"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { publicAsset } from "@/lib/assets";
import { initials } from "@/lib/format";
import type { VoterProfile } from "@/lib/types";

export function Avatar({ profile, compact = false, linked = false }: { profile: VoterProfile; compact?: boolean; linked?: boolean }) {
  const [failed, setFailed] = useState(profile.photoAvailable === false);
  const content = (
    <div className={`avatar-block${compact ? " avatar-compact" : ""}`}>
      <span className="avatar" aria-hidden="true">
        {profile.photo && !failed
          ? <Image src={publicAsset(profile.photo)} alt="" fill sizes={compact ? "46px" : "64px"} onError={() => setFailed(true)} />
          : initials(profile.name)}
      </span>
      <span><strong>{profile.name}</strong><small>{[profile.title, profile.affiliation].filter(Boolean).join(" · ")}</small></span>
    </div>
  );
  return linked ? <Link className="avatar-link" href={`/voters/${profile.id}`}>{content}</Link> : content;
}
