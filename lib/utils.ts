export function pointsForRank(rank: number): number {
  // AP style: 25 points for #1, down to 1 for #25
  return Math.max(26 - rank, 0);
}
