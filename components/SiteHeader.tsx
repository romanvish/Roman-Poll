"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader({ latestBallotsPath, latestComparePath }: { latestBallotsPath: string; latestComparePath: string }) {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Rankings", active: pathname === "/" || pathname.startsWith("/polls/") },
    { href: latestBallotsPath, label: "Ballots", active: pathname.startsWith("/ballots/") },
    { href: latestComparePath, label: "Compare", active: pathname.startsWith("/compare/") },
    { href: "/about", label: "About", active: pathname === "/about" },
  ];
  return (
    <header className="site-header">
      <div className="page-shell header-inner">
        <Link className="brand" href="/" aria-label="Roman Poll home"><span>R</span><strong>Roman Poll</strong></Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((link) => <Link key={link.href} className={link.active ? "active" : ""} href={link.href}>{link.label}</Link>)}
        </nav>
        <details className="mobile-menu">
          <summary aria-label="Open navigation"><span /><span /><span /></summary>
          <nav aria-label="Mobile navigation">
            {links.map((link) => <Link key={link.href} className={link.active ? "active" : ""} href={link.href}>{link.label}</Link>)}
          </nav>
        </details>
      </div>
    </header>
  );
}
