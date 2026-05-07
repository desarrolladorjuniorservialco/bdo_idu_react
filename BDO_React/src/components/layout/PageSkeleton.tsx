export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-48 rounded-lg bg-[var(--border)]" />

      <div
        className="rounded-xl p-5 space-y-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="h-4 w-64 rounded bg-[var(--border)]" />
        <div className="h-4 w-full rounded bg-[var(--border)]" />
        <div className="h-4 w-3/4 rounded bg-[var(--border)]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton, items never reorder
            <div key={i} className="h-16 rounded-lg bg-[var(--border)]" />
          ))}
        </div>
      </div>

      <div
        className="rounded-xl p-5 space-y-3"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="h-4 w-40 rounded bg-[var(--border)]" />
        <div className="h-4 w-full rounded bg-[var(--border)]" />
        <div className="h-4 w-5/6 rounded bg-[var(--border)]" />
        <div className="h-4 w-2/3 rounded bg-[var(--border)]" />
      </div>
    </div>
  );
}
