import { TIER_CONFIG } from '../data/mockData';

export default function ScoreBar({ score = 0, tier, showLabel = true, size = 'md' }) {
  const pct = Math.min((score / 1000) * 100, 100);
  const cfg = TIER_CONFIG[tier ?? 'COMMON'] ?? TIER_CONFIG.COMMON;
  const h   = size === 'sm' ? 'h-1' : 'h-2';
  return (
    <div className="w-full">
      <div className={`${h} w-full bg-white/10 overflow-hidden`} style={{ borderRadius: 0 }}>
        <div className={`${h} transition-all duration-700`}
          style={{ width: `${pct}%`, background: cfg.color, boxShadow: `0 0 6px ${cfg.color}88` }} />
      </div>
      {showLabel && <span className="text-xs font-mono mt-0.5 block" style={{ color: cfg.color }}>{score}</span>}
    </div>
  );
}
