"use client";

import Image from "next/image";
import { useState } from "react";
import { publicAsset } from "@/lib/assets";
import { initials } from "@/lib/format";
import type { VoterProfile } from "@/lib/types";

export function ProfilePortrait({ profile }: { profile: VoterProfile }) {
  const [failed, setFailed] = useState(profile.photoAvailable === false);
  return (
    <div className="profile-portrait">
      {profile.photo && !failed
        ? <Image src={publicAsset(profile.photo)} alt={`Portrait of ${profile.name}`} fill sizes="(max-width: 680px) 100vw, 360px" priority onError={() => setFailed(true)} />
        : <span aria-hidden="true">{initials(profile.name)}</span>}
    </div>
  );
}
