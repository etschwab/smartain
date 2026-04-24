export function StatCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="card">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{note}</p>
    </div>
  );
}
