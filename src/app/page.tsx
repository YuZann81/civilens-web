export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#faf8f5] text-[#2c2926]">
      {/* Header / Brand */}
      <header className="border-b border-[#eae2d3] bg-[#faf8f5]/90 backdrop-blur-xs sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <svg
              className="h-7 w-7 text-[#2d6a36]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
            <span className="text-xl font-bold tracking-tight text-[#1c4123]">
              CiviLens
            </span>
          </div>
          <span className="rounded-full bg-[#e5f0e6] px-3 py-1 text-xs font-semibold text-[#22512a]">
            Phase 0 Foundation
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-16">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#cbe0ce] bg-[#f4f8f4] px-4 py-1.5 text-sm font-medium text-[#22512a]">
            <span>Community-driven environmental transparency</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-[#17361d] sm:text-5xl">
            Making local environmental issues visible, actionable, and transparent.
          </h1>

          <p className="max-w-2xl text-lg text-[#57524d] leading-relaxed">
            CiviLens connects citizens, thoughtful candidate solution analysis, community
            decision-making, and government action into a single verified lifecycle.
          </p>

          <div className="grid gap-4 pt-6 sm:grid-cols-3">
            <div className="rounded-xl border border-[#eae2d3] bg-[#ffffff] p-5 shadow-xs">
              <h2 className="font-semibold text-[#1c4123]">Report</h2>
              <p className="mt-1 text-sm text-[#57524d]">
                Citizens document environmental concerns with verified locations and media.
              </p>
            </div>
            <div className="rounded-xl border border-[#eae2d3] bg-[#ffffff] p-5 shadow-xs">
              <h2 className="font-semibold text-[#1c4123]">Participate</h2>
              <p className="mt-1 text-sm text-[#57524d]">
                Communities review actionable candidate solutions and vote on priority paths.
              </p>
            </div>
            <div className="rounded-xl border border-[#eae2d3] bg-[#ffffff] p-5 shadow-xs">
              <h2 className="font-semibold text-[#1c4123]">Verify</h2>
              <p className="mt-1 text-sm text-[#57524d]">
                Government resolutions progress transparently with verifiable evidence.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#eae2d3] py-6 text-center text-xs text-[#8c857e]">
        <div className="mx-auto max-w-6xl px-6">
          CiviLens &bull; Phase 0 Foundation
        </div>
      </footer>
    </div>
  );
}
