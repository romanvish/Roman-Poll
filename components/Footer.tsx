import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-inner">
        <div><p className="footer-mark">RP</p><p>Independent rankings.<br />Every ballot visible.</p></div>
        <nav aria-label="Footer navigation">
          <Link href="/">Latest poll</Link>
          <Link href="/about">Methodology</Link>
        </nav>
        <p className="footer-note">© {new Date().getFullYear()} Roman Poll<br />Built with Next.js</p>
      </div>
    </footer>
  );
}
