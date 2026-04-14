import { ShieldCheck } from "lucide-react";

const rarityBorder = {
  legendary: "border-amber-300/90 shadow-[0_0_16px_rgba(251,191,36,0.45)]",
  common: "border-emerald-400/70 shadow-[0_0_14px_rgba(52,211,153,0.35)]",
};

function initialsFromName(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function PlayerCard({ player, isActive = false, compact = false, className = "", trading = false }) {
  return (
    <article
      className={`overflow-hidden rounded-xl border bg-black/55 ${
        rarityBorder[player.rarity] ?? rarityBorder.common
      } ${isActive ? "animate-pulseGlow border-cyan-300 shadow-cyanStrong" : ""} ${className}`}
    >
      <div
        className={`relative border-b border-white/10 bg-gradient-to-b from-emerald-400/15 via-cyan-400/10 to-transparent ${
          compact ? "p-2" : "p-3"
        }`}
      >
        <div
          className={`mx-auto flex items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-emerald-500/40 to-cyan-500/30 font-bold text-white ${
            compact ? "h-12 w-12 text-sm" : "h-16 w-16 text-lg"
          }`}
        >
          {initialsFromName(player.name)}
        </div>
        <p className={`mt-2 truncate text-center font-bold uppercase text-white ${compact ? "text-xs" : "text-sm"}`}>
          {player.name}
        </p>
        <p className={`text-center uppercase tracking-widest text-zinc-300 ${compact ? "text-[10px]" : "text-[11px]"}`}>
          {player.team}
        </p>
      </div>

      <div className={`space-y-1 text-zinc-200 ${compact ? "px-2 py-1 text-[10px]" : "min-h-20 px-3 py-2 text-[11px]"}`}>
        {trading ? (
          <>
            <p>Current Bid: {player.currentBid}</p>
            <p>Buy Now: {player.buyNow}</p>
            <p>Time Left: {player.timeLeft}</p>
          </>
        ) : (
          <>
            <p>Rating: {player.rating}</p>
            {!compact && <p>Strike Rate: {player.strikeRate}</p>}
            <p>{compact ? `Role: ${player.role}` : `Economy: ${player.economy}`}</p>
          </>
        )}
      </div>

      {!compact && (
        <div className="flex items-center justify-between border-t border-white/10 px-3 py-2 text-[10px] uppercase tracking-wider text-zinc-300">
          <span>{player.role}</span>
          <span className="inline-flex items-center gap-1 text-cyan-200">
            <ShieldCheck className="h-3 w-3" />
            {player.points} pts
          </span>
        </div>
      )}
    </article>
  );
}

export default PlayerCard;
