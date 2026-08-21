import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="content-wrap footer-inner">
        <p className="footer-name"><strong>Smartrain</strong></p>
        <nav className="footer-links" aria-label="Rechtliche Links">
          <Link href="/impressum">Impressum</Link>
          <Link href="/datenschutz">Datenschutz</Link>
        </nav>
        <p className="footer-meta">© {new Date().getFullYear()} · Bern, Schweiz</p>
      </div>
    </footer>
  );
}
