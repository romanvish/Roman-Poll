import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell empty-state">
      <p className="eyebrow">404 · Out of bounds</p>
      <h1>That edition isn’t on the board.</h1>
      <p>The page may have moved, or the poll week has not been published yet.</p>
      <Link className="button" href="/">Return to the latest poll</Link>
    </div>
  );
}
