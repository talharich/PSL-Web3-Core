import { topBatsmen, topBowlers } from "../data/mockData";

function StatList({ title, rows, leftKey, rightKey }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cyan-200">{title}</h3>
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.name}
            className="flex items-center justify-between rounded-md border border-white/10 bg-black/35 px-3 py-2 text-xs text-zinc-100"
          >
            <p className="font-medium">{row.name}</p>
            <div className="text-right">
              <p>{leftKey}: {row[leftKey]}</p>
              <p>{rightKey}: {row[rightKey]}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  return (
    <div className="columns-1 gap-4 space-y-4 md:columns-2">
      <StatList title="Top Batsmen" rows={topBatsmen} leftKey="runs" rightKey="avg" />
      <StatList title="Top Bowlers" rows={topBowlers} leftKey="wickets" rightKey="economy" />
      <StatList title="Fantasy Points Leaders" rows={topBatsmen} leftKey="points" rightKey="avg" />
      <StatList title="Bowling Impact" rows={topBowlers} leftKey="points" rightKey="economy" />
    </div>
  );
}

export default Stats;
