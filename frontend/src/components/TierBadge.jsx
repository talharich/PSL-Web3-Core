import { TIER_CONFIG } from '../data/mockData';

const TIER_META = {
  COMMON: { icon: '○', glow: false },
  RARE:   { icon: '◆', glow: false },
  EPIC:   { icon: '✦', glow: true },
  LEGEND: { icon: '★', glow: true },
  ICON:   { icon: '⬡', glow: true },
};

export default function TierBadge({ tier, size = 'sm', animate = false }) {
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG.COMMON;
  const meta = TIER_META[tier] || TIER_META.COMMON;

  const sizeClass =
    size === 'lg'
      ? 'text-xs px-3.5 py-1.5'
      : 'text-[0.65rem] px-2.5 py-0.5';

  return (
    <span
      className={`
        relative inline-flex items-center gap-1.5
        font-semibold uppercase select-none
        rounded-xl border
        transition-all duration-300
        tracking-[0.14em] pr-1

        hover:scale-105 hover:-translate-y-[1px]
        ${animate ? 'animate-pulse' : ''}
        ${meta.glow ? 'shadow-[0_0_18px_rgba(34,197,94,0.25)]' : ''}
      `}
      style={{
        color: cfg.color,
        borderColor: `${cfg.color}55`,
        background: `linear-gradient(135deg, ${cfg.color}20, transparent)`,
        fontWeight: 700,
      }}
    >
      {/* ICON */}
      <span
        className="relative z-10"
        style={{
          fontSize: size === 'lg' ? '0.75rem' : '0.65rem',
          transform: 'translateX(5px)',
        }}
      >
        {meta.icon}
      </span>

      {/* LABEL */}
      <span className="relative z-10">
        {cfg.label.toUpperCase()}
      </span>

      {/* SHIMMER LAYER (only high tiers) */}
      {meta.glow && (
        <span
          className="absolute inset-0 opacity-0 hover:opacity-100 transition duration-500"
          style={{
            background: `linear-gradient(
              120deg,
              transparent 0%,
              ${cfg.color}22 40%,
              transparent 80%
            )`,
            transform: 'translateX(-100%)',
            animation: 'shine 2.5s infinite',
          }}
        />
      )}

      {/* BORDER GLOW AURA */}
      <span
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          boxShadow: `0 0 12px ${cfg.color}30`,
        }}
      />
    </span>
  );
}