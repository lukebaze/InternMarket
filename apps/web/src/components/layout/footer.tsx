export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-semibold text-gray-900">Interns.market</span>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Interns.market. All rights reserved.
          </p>
          <nav className="flex gap-4">
            <a
              href="https://docs.interns.market"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              Docs
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
