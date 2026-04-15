import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Wallet } from 'lucide-react';
import TierBadge from './TierBadge';
import { TIER_CONFIG } from '../data/mockData';
import { transformAxis } from 'framer-motion';

const TIER_GRADIENTS = {
  COMMON: { from: 'rgba(148,163,184,0.12)', mid: 'rgba(148,163,184,0.06)', color: '#94a3b8' },
  RARE: { from: 'rgba(96,165,250,0.18)', mid: 'rgba(96,165,250,0.08)', color: '#60a5fa' },
  EPIC: { from: 'rgba(192,132,252,0.18)', mid: 'rgba(192,132,252,0.08)', color: '#c084fc' },
  LEGEND: { from: 'rgba(251,146,60,0.22)', mid: 'rgba(251,146,60,0.09)', color: '#fb923c' },
  ICON: { from: 'rgba(34,197,94,0.18)', mid: 'rgba(34,197,94,0.08)', color: '#22c55e' },
};

/** Derive clean 2-letter initials from a full name */
function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** Placeholder shown when nft.image is missing */
function CardPlaceholder({ nft, cfg, grad }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 select-none"
      style={{
        background: `linear-gradient(160deg, ${grad.from} 0%, #060d08 100%)`,
      }}
    >
      {/* Soft radial glow behind initials */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 35%, ${grad.mid}, transparent 65%)`,
        }}
      />

      {/* Initials circle */}
      <div
        className="relative z-10 flex items-center justify-center rounded-full"
        style={{
          width: 60, height: 60,
          background: `${grad.color}12`,
          border: `1.5px solid ${grad.color}30`,
          color: grad.color,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        {initials(nft.playerName)}
      </div>

      {/* Name + moment */}
      <div className="relative z-10 text-center">
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: grad.color === '#94a3b8' ? '#cbd5e1' : `${grad.color}ee`,
            margin: 0,
          }}
        >
          {nft.playerName}
        </p>
        <p
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: grad.color,
            opacity: 0.75,
            margin: '4px 0 0',
          }}
        >
          {nft.moment}
        </p>
      </div>

      {/* Decorative lines */}
      <div className="relative z-10 flex flex-col items-center gap-1.5 mt-1">
        <div style={{ width: 52, height: 2, borderRadius: 2, background: grad.color, opacity: 0.2 }} />
        <div style={{ width: 34, height: 2, borderRadius: 2, background: grad.color, opacity: 0.12 }} />
      </div>
    </div>
  );
}

// ─── FIXED: added buyingTokenId prop ─────────────────────────────────────────
export default function NFTCard({ nft, showBuy = false, onBuy, buyingTokenId }) {
  const navigate = useNavigate();
  const prevTierRef = useRef(nft.tier);
  const videoRef = useRef(null);

  const [upgraded, setUpgraded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const tierKey = (nft.tier === 'LEGENDARY') ? 'LEGEND' : (nft.tier || 'COMMON');
  const cfg = TIER_CONFIG[tierKey] || TIER_CONFIG.COMMON;
  const grad = TIER_GRADIENTS[tierKey] || TIER_GRADIENTS.COMMON;
  const scorePercent = Math.min((nft.score / 1000) * 100, 100);
  const hasVideo = Boolean(nft.video);
  const hasImage = Boolean(nft.image);

  // ─── FIXED: derive buying state from prop ──────────────────────────────────
  const isBuying = buyingTokenId === nft.tokenId;

  /* tier-upgrade flash */
  useEffect(() => {
    if (prevTierRef.current !== nft.tier) {
      setUpgraded(true);
      const t = setTimeout(() => setUpgraded(false), 1200);
      prevTierRef.current = nft.tier;
      return () => clearTimeout(t);
    }
  }, [nft.tier]);

  /* play / pause on hover */
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (hovering) {
      vid.currentTime = 0;
      vid.play().catch(() => { });
    } else {
      vid.pause();
      vid.currentTime = 0;
    }
  }, [hovering]);

  return (
    <div
      onClick={() => navigate(`/nft/${nft.tokenId}`)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="relative overflow-hidden rounded-2xl cursor-pointer border border-white/10 bg-white/5 transition-all duration-500 hover:scale-[1.04] hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_30px_80px_rgba(0,0,0,0.6)] isolate"
      style={{
        boxShadow: upgraded ? `0 0 60px ${cfg.color}55` : '0 10px 40px rgba(0,0,0,0.4)',
        contain: 'layout-paint',
      }}
    >
      {/* Tier glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none z-0"
        style={{ background: `radial-gradient(circle at 50% 0%, ${cfg.color}22, transparent 60%)` }}
      />

      {/* ── MEDIA ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: '3/4', maxHeight: 280 }}
      >
        {/* Placeholder (always rendered behind; hidden when image/video visible) */}
        <CardPlaceholder nft={nft} cfg={cfg} grad={grad} />

        {/* Static image */}
        {hasImage && (
          <img
            src={nft.image}
            alt={`${nft.playerName} – ${nft.moment}`}
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-400"
            style={{ opacity: hovering && videoReady && hasVideo ? 0 : 1 }}
          />
        )}

        {/* Video */}
        {hasVideo && (
          <video
            ref={videoRef}
            src={nft.video}
            muted
            loop
            playsInline
            preload="metadata"
            onCanPlay={() => setVideoReady(true)}
            onLoadedData={() => setVideoReady(true)}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-400"
            style={{ opacity: hovering && videoReady ? 1 : 0 }}
          />
        )}

        {/* Play badge */}
        {hasVideo && (
          <div
            className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide transition-all duration-300"
            style={{
              background: hovering ? `${cfg.color}cc` : 'rgba(0,0,0,0.55)',
              color: hovering ? '#000' : '#fff',
              opacity: hovering ? 1 : 0.65,
              transform: hovering ? 'scale(1)' : 'scale(0.9)',
            }}
          >
            <svg width="7" height="8" viewBox="0 0 7 8" fill="currentColor">
              <path d="M0.5 0.5L6.5 4L0.5 7.5V0.5Z" />
            </svg>
            {hovering && videoReady ? 'LIVE' : 'PLAY'}
          </div>
        )}

        {/* Tier badge with dark underlay */}
        <div className="absolute top-3 left-3 z-10">
          {/* Dark semi-transparent underlay */}
          <div 
            className="absolute rounded-lg pointer-events-none hover:scale-105 hover:-translate-y-[1px] " 
            style={{ 
              inset: '-3px',
              background: 'rgba(0, 0, 0, 0.57)',
              backdropFilter: 'blur(12px)',
            }} 
          />
          {/* Badge on top */}
          <div className="relative">
            <TierBadge tier={nft.tier} animate={upgraded} />
          </div>
        </div>

        {/* Token id */}
        <span className="absolute top-3 right-3 z-10 text-[10px] text-white/35 font-mono">
          #{nft.tokenId}
        </span>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }}
        />
      </div>

      {/* ── PLAYER INFO ── */}
      <div
        className="px-4 pt-3 pb-1"
        style={{ background: `linear-gradient(145deg, ${grad.from}, #060d08)` }}
      >
        <h3 className="text-base font-semibold text-white truncate leading-tight pt-2">
          {nft.playerName}
        </h3>
        <p className="text-xs text-gray-400 truncate pt-1">{nft.team}</p>
        <p className="text-xs mt-0.5 font-medium truncate" style={{ color: cfg.color }}>
          {nft.moment}
        </p>

        <div className="mt-3 px-3 py-2 rounded-xl bg-black/30 border border-white/10">
          <p className="text-[11px] text-gray-400 italic truncate">"{nft.stat}"</p>
        </div>
      </div>

      {/* ── SCORE ── */}
      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] text-gray-400">Performance</span>
          <span className="text-lg font-bold leading-none" style={{ color: cfg.color }}>
            {nft.score}
            <span className="text-[10px] text-gray-500 font-normal"> /1000</span>
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${scorePercent}%`, background: cfg.color, boxShadow: `0 0 6px ${cfg.color}88` }}
          />
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm">
          <Wallet size={13} className="text-gray-400" />
          <span className="text-green-400 font-semibold">
            ${nft.estimatedValue.toLocaleString()}
          </span>
        </div>

        {/* ─── FIXED: buy button now works + shows loading state ─────────────── */}
        {showBuy && nft.listed ? (
          <button
            onClick={e => { e.stopPropagation(); onBuy?.(nft); }}
            disabled={isBuying}
            className="px-4 py-1.5 text-xs rounded-xl font-semibold bg-green-500 text-black hover:scale-105 hover:shadow-[0_0_16px_rgba(34,197,94,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isBuying
              ? 'Buying...'
              : `Buy · $${nft.listPrice?.toLocaleString()}`}
          </button>
        ) : (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Zap size={11} className="text-green-400" />
            Gasless
          </div>
        )}
      </div>
    </div>
  );
}