export default function DashboardLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <header
        className="glass-strong sticky top-0 z-50 flex h-16 items-center border-b px-4 md:px-6"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="hidden flex-1 md:block md:ml-72">
          <div className="mx-auto max-w-xl">
            <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="h-9 w-9 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-9 w-9 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-9 w-9 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </header>
      <div className="relative flex">
        <aside className="pointer-events-none fixed left-0 top-16 z-30 hidden h-[calc(100vh-4rem)] w-72 overflow-y-auto border-r bg-white/80 backdrop-blur-xl md:pointer-events-auto md:block" style={{ borderColor: "var(--border)" }}>
          <div className="flex h-full flex-col">
            <div className="px-6 py-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>
            <div className="mx-4 mb-6">
              <div className="glass-card rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 animate-pulse rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-6 px-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200 ml-3" />
                  <div className="space-y-1">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
        <main className="min-h-[calc(100vh-4rem)] flex-1 p-4 md:ml-72 md:p-6 lg:p-8">
          <div className="mb-8 space-y-2">
            <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-96 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-[20px] border border-gray-200 bg-white" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="h-80 animate-pulse rounded-[20px] border border-gray-200 bg-white xl:col-span-2" />
            <div className="h-80 animate-pulse rounded-[20px] border border-gray-200 bg-white" />
          </div>
        </main>
      </div>
    </div>
  );
}
