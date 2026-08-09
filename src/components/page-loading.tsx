export function PageLoading({ label = "Loading your quest…" }: { label?: string }) {
  return (
    <main className="mx-auto w-full max-w-6xl animate-pulse px-5 py-10" aria-busy="true" aria-label={label}>
      <span className="sr-only">{label}</span>
      <div className="h-4 w-28 rounded bg-muted" />
      <div className="mt-4 h-10 w-72 max-w-full rounded-xl bg-muted" />
      <div className="mt-3 h-5 w-96 max-w-full rounded bg-muted" />
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="h-32 rounded-2xl border bg-card" />)}
      </div>
      <div className="mt-8 h-64 rounded-3xl border bg-card" />
    </main>
  );
}
