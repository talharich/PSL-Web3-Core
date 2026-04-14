import PlayerCard from "../components/PlayerCard";
import { players } from "../data/mockData";

function FilterPanel({ title, children }) {
  return (
    <section className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-md shadow-lg">
      <h3 className="mb-4 inline-block bg-gradient-to-r from-emerald-300 via-teal-200 to-lime-200 bg-clip-text text-xs font-extrabold uppercase tracking-[0.2em] text-transparent drop-shadow-md md:text-sm">
        {title}
      </h3>
      {children}
    </section>
  );
}

import lqLogo from "../../Pics/Lahore-Qalandars-PSL-Team-.png";
import kkLogo from "../../Pics/Karachi-Kings-PSL-Team-.png";
import iuLogo from "../../Pics/Islamabad-United-PSL-Team-.png";
import msLogo from "../../Pics/Multan-Sultans-PSL-Team-.png";
import pzLogo from "../../Pics/Peshawar-Zalmi-PSL-Team-.png";
import qgLogo from "../../Pics/Quetta-Gladiators-PSL-Team-.png";

const teamFilters = [
  { id: "LQ", logo: lqLogo },
  { id: "KK", logo: kkLogo },
  { id: "IU", logo: iuLogo },
  { id: "MS", logo: msLogo },
  { id: "PZ", logo: pzLogo },
  { id: "QG", logo: qgLogo },
];

import pslBackground from "../../Pics/PSL-Background.png";

function FantasyDashboard() {
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
      <div className="relative z-10 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <FilterPanel title="Filter by Team">
            <div className="grid grid-cols-3 gap-3">
              {teamFilters.map((team) => (
                <div
                  key={team.id}
                  className="ui-hover-chip flex h-14 w-full cursor-pointer items-center justify-center rounded-xl border border-lime-300/20 bg-gradient-to-br from-emerald-900/40 to-[#0a140a]/80 p-2 shadow-[0_0_10px_rgba(163,230,53,0.1)] transition-all hover:scale-105 hover:border-lime-300 hover:shadow-[0_0_15px_rgba(163,230,53,0.4)]"
                >
                  <img src={team.logo} alt={team.id} className="h-full w-full object-contain drop-shadow-md" />
                </div>
              ))}
            </div>
          </FilterPanel>
          <FilterPanel title="Filter by Role">
            <div className="flex flex-wrap gap-2 text-xs">
              {["Batsman", "Bowler", "All-Rounder"].map((role) => (
                <span key={role} className="ui-hover-chip cursor-pointer rounded-full border border-cyan-400/30 bg-gradient-to-r from-cyan-900/30 to-blue-900/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-100 shadow-[0_0_8px_rgba(34,211,238,0.15)] transition-all hover:border-cyan-300 hover:text-cyan-300 hover:shadow-cyanGlow">
                  {role}
                </span>
              ))}
            </div>
          </FilterPanel>
          <FilterPanel title="Player Stats">
            <div className="space-y-2 text-xs text-zinc-200">
              {["Strike Rate", "Average", "Economy", "Catches"].map((entry) => (
                <div key={entry} className="ui-hover-chip flex cursor-pointer items-center justify-between rounded-md border border-white/5 bg-white/5 px-3 py-2 transition-colors hover:border-emerald-400/50 hover:bg-emerald-900/20">
                  <span className="font-bold tracking-wide text-zinc-300 group-hover:text-emerald-200">{entry}</span>
                  <span className="h-2 w-2 rounded-full bg-cyan-300" />
                </div>
              ))}
            </div>
          </FilterPanel>
        </aside>

        <main className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5 pt-2">
          {players.map((player, idx) => (
            <PlayerCard key={player.id} player={player} isActive={idx === 3 || idx === 7} />
          ))}
        </main>
      </div>
    </>
  );
}

export default FantasyDashboard;
