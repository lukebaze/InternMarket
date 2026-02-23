export function Footer() {
  return (
    <footer className="border-t border-bg-border bg-bg-page mt-auto">
      <div className="flex h-14 items-center justify-between px-12">
        <span className="font-ui text-[13px] font-semibold text-text-primary tracking-[3px]">
          I N T E R N S
        </span>
        <p className="font-mono text-[10px] text-text-muted">
          &copy; {new Date().getFullYear()} Interns.market. All rights reserved.
        </p>
        <nav className="flex gap-4">
          <a
            href="https://docs.interns.market"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] text-text-tertiary hover:text-text-secondary transition-colors"
          >
            Docs
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] text-text-tertiary hover:text-text-secondary transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
