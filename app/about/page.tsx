import type { Metadata } from "next";
import { Avatar } from "@/components/Avatar";
import { getPollData } from "@/lib/data";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "How Roman Poll works and who casts the ballots.",
};

export default function AboutPage() {
  const { voters } = getPollData();
  return (
    <div className="page-shell page-stack about-page">
      <header className="page-heading narrow-heading">
        <p className="eyebrow">Our method</p>
        <h1>A poll you can inspect, not just accept.</h1>
        <p className="lede">Roman Poll combines independent Top 25 ballots into one transparent weekly ranking. Every point can be traced back to a voter.</p>
      </header>

      <section className="method-grid" aria-labelledby="method-title">
        <div className="section-intro">
          <p className="section-number">01</p>
          <h2 id="method-title">How it works</h2>
        </div>
        <div className="method-steps">
          <article><span>25→1</span><h3>Points by position</h3><p>A first-place vote earns 25 points, second earns 24, continuing down to one point at No. 25.</p></article>
          <article><span>Σ</span><h3>Ballots combined</h3><p>Points from every ballot are totaled. First-place votes and ballot coverage remain visible beside the result.</p></article>
          <article><span>±</span><h3>Movement tracked</h3><p>Each edition is compared with the prior week to show risers, fallers, new arrivals, and teams leaving the Top 25.</p></article>
          <article><span>=</span><h3>Ties resolved</h3><p>Ties are broken by best average ballot rank, then alphabetically for a stable and reproducible order.</p></article>
        </div>
      </section>

      <section aria-labelledby="voters-title">
        <div className="section-heading-row">
          <div><p className="eyebrow">The panel</p><h2 id="voters-title">Meet the voters</h2></div>
          <p>{voters.length} independent voices</p>
        </div>
        <div className="profile-grid">
          {voters.map((profile) => (
            <article className="profile-card" key={profile.id}>
              <Avatar profile={profile} linked />
              {profile.bio[0] && <p>{profile.bio[0]}</p>}
              <Link className="text-link" href={`/voters/${profile.id}`}>View voter profile <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
