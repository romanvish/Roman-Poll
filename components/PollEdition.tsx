import Link from "next/link";
import { compareWeeks } from "@/lib/compute";
import { getPollData } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { getWeeklySuperlatives } from "@/lib/insights";
import type { EditionSummary, WeekFile } from "@/lib/types";
import { EditionPicker } from "./EditionPicker";
import { RankingTable } from "./RankingTable";
import { Superlatives } from "./Superlatives";

export function PollEdition({ edition, previous, editions, isHome = false }: { edition: WeekFile; previous?: WeekFile; editions: EditionSummary[]; isHome?: boolean }) {
  const result = compareWeeks(edition, previous);
  const { teams, voters } = getPollData();
  const leader = result.rankings[0];
  const receivingVotes = new Set(edition.voters.flatMap((voter) => voter.ballot.map((entry) => entry.team))).size;
  return (
    <div className="page-stack">
      <section className="poll-hero">
        <div className="page-shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">{isHome ? "The latest edition" : "Roman Poll Top 25"} · {formatDate(edition.publishedAt)}</p>
            <h1>{edition.editorial.headline}</h1>
            <p className="lede">{edition.editorial.dek}</p>
            <div className="hero-actions">
              <Link className="button" href={`/ballots/${edition.season}/week/${edition.week}`}>Explore every ballot <span aria-hidden="true">→</span></Link>
              <EditionPicker editions={editions} current={edition} section="polls" />
            </div>
          </div>
          <aside className="number-one" aria-label={`Number one: ${leader.team}`}>
            <p>No. 1</p><strong>{leader.team}</strong><span>{leader.points} / {leader.pointsAvailable} points</span>
            <div className="number-one-rank">1</div>
          </aside>
        </div>
      </section>

      <div className="page-shell page-stack">
        <section className="stat-grid" aria-label="Edition summary">
          <div><span>{edition.voters.length}</span><p>Ballots cast</p></div>
          <div><span>{receivingVotes}</span><p>Teams receiving votes</p></div>
          <div><span>{leader.firstPlaceVotes}</span><p>First-place votes for No. 1</p></div>
          <div><span>{result.droppedTeams.length || "—"}</span><p>Teams dropped out</p></div>
        </section>

        <section aria-labelledby="rankings-title">
          <div className="section-heading-row">
            <div><p className="eyebrow">{edition.season} · Week {edition.week}</p><h2 id="rankings-title">The Top 25</h2></div>
            <p>25 points for first · 1 for 25th</p>
          </div>
          <RankingTable rows={result.rankings} teams={teams} />
          {result.droppedTeams.length > 0 && <p className="dropped"><strong>Dropped out:</strong> {result.droppedTeams.join(", ")}</p>}
        </section>

        <Superlatives items={getWeeklySuperlatives(edition, previous)} teams={teams} voters={voters} />

        <section className="analysis-grid" aria-labelledby="analysis-title">
          <div className="section-intro"><p className="section-number">02</p><h2 id="analysis-title">Read the poll</h2></div>
          <div className="analysis-copy">{edition.editorial.analysis.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </section>

        <section className="highlight-grid" aria-label="Edition highlights">
          {edition.editorial.highlights.map((highlight, index) => (
            <article key={highlight.title}><p>{String(index + 1).padStart(2, "0")} · {highlight.label}</p><h3>{highlight.title}</h3><span>{highlight.body}</span></article>
          ))}
        </section>
      </div>
    </div>
  );
}
