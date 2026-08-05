import type { Movement } from "@/lib/types";

export function MovementBadge({ movement }: { movement: Movement }) {
  if (movement.kind === "new") return <span className="movement new">NEW</span>;
  if (movement.kind === "same") return <span className="movement same"><span aria-hidden="true">—</span><span className="sr-only">No change</span></span>;
  const up = movement.kind === "up";
  return <span className={`movement ${movement.kind}`}><span aria-hidden="true">{up ? "↑" : "↓"}</span> {movement.spots}<span className="sr-only"> {up ? "places up" : "places down"}</span></span>;
}
