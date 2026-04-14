import PlayerCard from "../components/PlayerCard";
import { players } from "../data/mockData";

import pslBackground from "../../Pics/PSL-Background.png";

function Marketplace() {
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
      <div className="relative z-10 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-md shadow-lg">
          <h3 className="mb-4 inline-block bg-gradient-to-r from-emerald-300 via-teal-200 to-lime-200 bg-clip-text text-xs font-extrabold uppercase tracking-[0.2em] text-transparent drop-shadow-md md:text-sm">
            Market Filters
          </h3>
          <div className="space-y-2 text-xs text-zinc-200">
            {["Sort by Price", "Filter by Role", "Tier", "Price Range"].map((item) => (
              <div key={item} className="ui-hover-chip cursor-pointer rounded-md border border-lime-100/10 bg-[#1f2d17]/88 p-3 font-semibold uppercase tracking-wider text-lime-100 transition-colors hover:border-lime-400/50 hover:bg-lime-900/30 hover:text-lime-200">
                {item}
              </div>
            ))}
          </div>
        </aside>
        <main className="grid grid-cols-2 gap-4 lg:grid-cols-3 pt-2">
          {players.slice(0, 9).map((player) => (
            <PlayerCard key={player.id} player={player} trading />
          ))}
        </main>
      </div>
    </>
  );
}

export default Marketplace;
