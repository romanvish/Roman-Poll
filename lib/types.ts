export type TeamRank = {
  rank: number;
  team: string;
  record: string;
};

export type VoterBallot = {
  voterId: string;
  ballot: TeamRank[];
};

export type EditorialHighlight = {
  label: string;
  title: string;
  body: string;
};

export type WeekEditorial = {
  headline: string;
  dek: string;
  analysis: string[];
  highlights: EditorialHighlight[];
};

export type WeekFile = {
  season: number;
  week: number;
  publishedAt: string;
  editorial: WeekEditorial;
  voters: VoterBallot[];
};

export type VoterProfile = {
  id: string;
  name: string;
  title?: string;
  affiliation?: string;
  photo?: string;
  photoAvailable?: boolean;
  location?: string;
  specialties: string[];
  bio: string[];
  links: { label: string; url: string }[];
};

export type TeamProfile = {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
  logoAvailable?: boolean;
};

export type ConsensusLevel = "unanimous" | "close" | "split";

export type Movement =
  | { kind: "up"; spots: number }
  | { kind: "down"; spots: number }
  | { kind: "same" }
  | { kind: "new" };

export type AggregatedTeam = {
  team: string;
  points: number;
  pointsAvailable: number;
  ballots: number;
  voteShare: number;
  firstPlaceVotes: number;
  averageRank: number;
  rankSpread: number;
  rankStandardDeviation: number;
  consensus: ConsensusLevel;
  record: string;
  currentRank: number;
  movement: Movement;
};

export type PollComparison = {
  rankings: AggregatedTeam[];
  droppedTeams: string[];
};

export type EditionSummary = {
  season: number;
  week: number;
  publishedAt: string;
  headline: string;
};

export type VoterTeamDelta = {
  team: string;
  voterRank: number;
  fieldAverageRank: number;
  delta: number;
};

export type VoterLens = {
  higher: VoterTeamDelta[];
  lower: VoterTeamDelta[];
  available: boolean;
};

export type WeeklySuperlatives = {
  strongestConsensus?: AggregatedTeam;
  mostDivisive?: AggregatedTeam;
  biggestClimber?: AggregatedTeam;
  boldestBallot?: VoterTeamDelta & { voterId: string };
};

export type TeamHistoryPoint = {
  season: number;
  week: number;
  publishedAt: string;
  rank: number | null;
  points: number;
  record: string | null;
};

export type TeamSeasonHistory = {
  season: number;
  currentRank: number | null;
  seasonHigh: number | null;
  weeksRanked: number;
  latestRecord: string | null;
  points: TeamHistoryPoint[];
};

export type ComparisonRow = {
  team: string;
  pollRank: number | null;
  leftRank: number;
  rightRank: number;
  gap: number;
};
