import PlayerCard from "../components/PlayerCard";
import { players } from "../data/mockData";
import teamPitchBackground from "../../Pics/background_pic.png";

const formation = [
  { left: "50%", top: "2%" },  

  { left: "33%", top: "18%" }, 
  { left: "67%", top: "18%" }, 

  { left: "16%", top: "36%" }, 
  { left: "50%", top: "36%" }, 
  { left: "84%", top: "36%" }, 

  { left: "33%", top: "54%" }, 
  { left: "67%", top: "54%" }, 

  { left: "16%", top: "74%" }, 
  { left: "50%", top: "74%" }, 
  { left: "84%", top: "74%" }, 
];

function MyTeam() {
  const eleven = players.slice(0, 11);

  return (
    <>
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(5, 10, 6, 0.3), rgba(7, 11, 8, 0.62), rgba(10, 14, 8, 0.85)), url(${teamPitchBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      
      <section className="relative z-10 min-h-[960px] pt-4 md:pt-6">
        <div className="ui-hover-panel absolute right-4 top-4 z-20 rounded-xl border border-white/20 bg-[#1e2e17]/70 p-4 shadow-cyanGlow backdrop-blur-md">
        <h3 className="text-sm font-semibold text-lime-100">Team Score Prediction: 425 pts</h3>
        <ul className="mt-2 space-y-1 text-xs text-zinc-100">
          <li>3x Captain Multiplier</li>
          <li>1.5x Bowler Boost</li>
        </ul>
      </div>

      <h2 className="relative z-10 mb-8 inline-block select-none bg-gradient-to-r from-emerald-300 via-teal-200 to-lime-200 bg-clip-text text-2xl font-extrabold uppercase tracking-[0.15em] text-transparent drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] md:text-3xl">
        My Fantasy Best 11
      </h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {eleven.map((player, index) => (
          <PlayerCard key={player.id} player={player} isActive={index === 0 || index === 4} compact />
        ))}
      </div>

      <div className="relative hidden lg:block" style={{ height: "1150px" }}>
        {eleven.map((player, index) => (
          <div
            key={player.id}
            className="absolute flex justify-center w-[180px] -translate-x-1/2"
            style={{ left: formation[index].left, top: formation[index].top, zIndex: 30 - index }}
          >
            <PlayerCard player={player} isActive={index === 3 || index === 4} compact />
          </div>
        ))}
      </div>
    </section>
    </>
  );
}

export default MyTeam;
