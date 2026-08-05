"use client";

import { useRouter } from "next/navigation";
import type { EditionSummary, WeekFile } from "@/lib/types";

export function EditionPicker({ editions, current, section }: { editions: EditionSummary[]; current: Pick<WeekFile, "season" | "week">; section: "polls" | "ballots" | "compare" }) {
  const router = useRouter();
  return (
    <label className="edition-picker">
      <span>Browse editions</span>
      <select
        aria-label="Choose poll edition"
        value={`${current.season}-${current.week}`}
        onChange={(event) => {
          const [season, week] = event.target.value.split("-");
          router.push(`/${section}/${season}/week/${week}`);
        }}
      >
        {[...editions].reverse().map((edition) => <option key={`${edition.season}-${edition.week}`} value={`${edition.season}-${edition.week}`}>{edition.season} · Week {edition.week}</option>)}
      </select>
    </label>
  );
}
