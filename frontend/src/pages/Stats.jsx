import { topBatsmen, topBowlers } from "../data/mockData";

function StatList({ title, rows, leftKey, rightKey }) {
  return (
    <section className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-md shadow-lg">
      <h3 className="mb-4 inline-block bg-gradient-to-r from-emerald-300 via-teal-200 to-lime-200 bg-clip-text text-xs font-extrabold uppercase tracking-[0.2em] text-transparent drop-shadow-md md:text-sm">
        {title}
      </h3>
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.name}
            className="ui-hover-chip flex cursor-pointer items-center justify-between rounded-md border border-lime-100/10 bg-[#1f2d17]/88 px-4 py-3 text-xs text-zinc-100 transition-all hover:border-lime-400/50 hover:bg-lime-900/30 hover:shadow-[0_0_15px_rgba(163,230,53,0.15)]"
          >
            <p className="font-extrabold tracking-wide text-emerald-100">{row.name}</p>
            <div className="text-right font-medium text-emerald-200/80">
              <p>{leftKey}: {row[leftKey]}</p>
              <p>{rightKey}: {row[rightKey]}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import pslBackground from "../../Pics/PSL-Background.png";

function Stats() {
  return (
    <>
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(5, 10, 6, 0.3), rgba(7, 11, 8, 0.62), rgba(10, 14, 8, 0.85)), url(${pslBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="relative z-10 columns-1 gap-4 space-y-4 md:columns-2">
        <StatList title="Top Batsmen" rows={topBatsmen} leftKey="runs" rightKey="avg" />
        <StatList title="Top Bowlers" rows={topBowlers} leftKey="wickets" rightKey="economy" />
        <StatList title="Fantasy Points Leaders" rows={topBatsmen} leftKey="points" rightKey="avg" />
        <StatList title="Bowling Impact" rows={topBowlers} leftKey="points" rightKey="economy" />
      </div>
    </>
  );
}

export default Stats;
