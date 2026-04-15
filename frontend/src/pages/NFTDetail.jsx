import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Wallet, Clock, TrendingUp, ExternalLink, Zap } from 'lucide-react';
import { useEffect } from 'react';
import TierBadge from '../components/TierBadge';
import PageTransitionWrapper from './PageTransitionWrapper'; // NEW: Import transition wrapper
import { useNFT } from '../hooks/useNFTData';
import { usePageTransition } from './PageTransitionContext'; // NEW: Import transition context
import { TIER_CONFIG } from '../data/mockData';

const COMPONENT_LABELS = {
  form:       { label: 'Recent Form',       max: 400 },
  milestone:  { label: 'Career Milestones', max: 250 },
  popularity: { label: 'Trade Popularity',  max: 200 },
  rarity:     { label: 'Mint Rarity',       max: 150 },
};

const PLAYER_EMOJIS = {
  'babar-azam': '🏏', 'shaheen-afridi': '🎳',
  'mohammad-rizwan': '🧤', 'fakhar-zaman': '💥',
};

/**
 * NFTDetailContent - Inner content component (wrapped by PageTransitionWrapper)
 * This separation allows the entire page to animate as a unit
 */
function NFTDetailContent({ nft }) {
  const cfg = TIER_CONFIG[nft.tier];
  const barClass = `bar-${nft.tier.toLowerCase()}`;
  const borderClass = `nft-border-${nft.tier.toLowerCase()}`;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Back button with smooth entrance */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-psl-muted hover:text-white font-body text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={13} /> Back to collection
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* ── Left: Visual ── */}
        <div className="space-y-4">
          {/* Main NFT visual */}
          <div
            className={`card p-10 text-center relative overflow-hidden ${borderClass}`}
            style={{ boxShadow: `0 0 80px ${cfg.color}25, 0 0 160px ${cfg.color}10` }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 40%, ${cfg.color}18 0%, transparent 65%)`,
              }}
            />

            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage: `linear-gradient(${cfg.color}08 1px, transparent 1px), linear-gradient(90deg, ${cfg.color}08 1px, transparent 1px)`,
                backgroundSize: '32px 32px',
              }}
            />

            <div className="relative z-10">
              <div
                className="text-8xl mb-5 inline-block animate-float"
                style={{ filter: `drop-shadow(0 0 20px ${cfg.color}50)` }}
              >
                {PLAYER_EMOJIS[nft.playerId] || '🏏'}
              </div>

              <div className="mb-4">
                <TierBadge tier={nft.tier} size="lg" />
              </div>

              <h1 className="font-display text-5xl text-white mb-1 tracking-wide">
                {nft.playerName}
              </h1>

              <p className="font-body font-semibold mb-1" style={{ color: cfg.color }}>
                {nft.moment}
              </p>

              <p className="text-gray-400 text-sm font-body italic">
                "{nft.stat}"
              </p>

              <p className="text-psl-muted text-xs font-body mt-1">
                {nft.matchContext}
              </p>

              <div className="divider my-5" />

              <div className="flex justify-center gap-6 text-sm font-body">
                <div className="text-center">
                  <p className="section-label mb-1">Token ID</p>
                  <p className="text-white font-mono">#{nft.tokenId}</p>
                </div>

                <div className="text-center">
                  <p className="section-label mb-1">Rarity</p>
                  <p className="text-white">{nft.mintRarity}%</p>
                </div>

                <div className="text-center">
                  <p className="section-label mb-1">Value</p>
                  <p className="text-psl-gold font-semibold">
                    ${nft.estimatedValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Narrative */}
          <div className="card p-6" style={{ borderColor: 'rgba(201,168,76,0.18)' }}>
            <p className="section-label mb-3">AI-Generated Narrative</p>
            <p className="text-gray-200 font-body leading-relaxed italic text-sm">
              "{nft.narrative}"
            </p>
            <div className="divider my-3" />
            <p className="section-label">
              claude-sonnet-4-20250514 · Generated on mint
            </p>
          </div>

          {/* ERC-6551 Wallet */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="text-psl-gold" size={15} />
              <p className="text-white font-body font-semibold text-sm">
                ERC-6551 Token Wallet
              </p>
              <span className="pill pill-live text-[0.55rem] ml-auto">Active</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-body">
                <span className="text-psl-muted">Balance</span>
                <span className="font-semibold text-psl-gold">0.042 ETH</span>
              </div>

              <div className="flex justify-between text-sm font-body">
                <span className="text-psl-muted">Platform fees earned</span>
                <span className="font-semibold text-green-400">+0.003 ETH</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Stats ── */}
        <div className="space-y-4">
          {/* Score breakdown */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl text-white">
                Performance Score
              </h2>
              <TierBadge tier={nft.tier} />
            </div>

            <div className="flex items-end gap-4 mb-7">
              <span
                className="font-display text-7xl leading-none"
                style={{
                  color: cfg.color,
                  textShadow: `0 0 40px ${cfg.color}50`
                }}
              >
                {nft.score}
              </span>
              <span className="text-psl-muted font-body text-sm mb-2">
                /1000
              </span>
            </div>

            <div className="space-y-4">
              {Object.entries(nft.scoreComponents).map(([key, val]) => {
                const meta = COMPONENT_LABELS[key];
                const pct = (val / meta.max) * 100;

                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm font-body mb-2">
                      <span className="text-gray-300">{meta.label}</span>
                      <span className="font-semibold" style={{ color: cfg.color }}>
                        {val}
                        <span className="text-psl-muted font-normal">
                          {' '} / {meta.max}
                        </span>
                      </span>
                    </div>

                    <div className="progress-track">
                      <div
                        className={`progress-fill bar-${nft.tier.toLowerCase()}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upgrade history */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="text-psl-muted" size={15} />
              <h2 className="font-display text-2xl text-white">
                Upgrade History
              </h2>
            </div>

            <div className="space-y-4">
              {nft.upgradeHistory.map((h, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <TierBadge tier={h.from} />
                      <TrendingUp size={12} className="text-psl-muted" />
                      <TierBadge tier={h.to} />
                    </div>

                    <div className="text-right">
                      <p className="section-label">{h.date}</p>
                      <p className="text-xs font-body text-gray-400 mt-0.5">
                        Score: {h.score}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="card p-5">
            <h2 className="font-display text-xl text-white mb-4">Actions</h2>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button className="btn-primary py-2.5 text-sm">
                List for Sale
              </button>

              <button className="btn-ghost py-2.5 text-sm">
                <ExternalLink size={13} />
                Etherscan
              </button>
            </div>

            <div className="px-4 py-3 text-center"
              style={{
                background: 'rgba(26,107,60,0.12)',
                border: '1px solid rgba(26,107,60,0.25)'
              }}
            >
              <p className="text-psl-muted text-xs font-body">
                <span className="text-psl-gold">10%</span> player ·{' '}
                <span className="text-green-400">5%</span> platform ·{' '}
                <span className="text-white">85%</span> you
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * NFTDetail - Main component with transition wrapper
 * Handles data loading and wraps content with PageTransitionWrapper
 */
export default function NFTDetail() {
  const { tokenId } = useParams();
  const nft = useNFT(tokenId);
  
  // NEW: Get transition context to notify on page exit
  const { onPageExit } = usePageTransition();

  // NEW: Notify transition system when user navigates away
  useEffect(() => {
    return () => {
      onPageExit(); // Call when component unmounts
    };
  }, [onPageExit]);

  if (!nft) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="font-display text-3xl text-psl-muted mb-4">NFT Not Found</p>
        <Link to="/dashboard" className="btn-ghost text-sm">← Back to collection</Link>
      </div>
    );
  }

  return (
    <PageTransitionWrapper>
      {/* animationType="card"> */}
      {/* NEW: All page content is wrapped for smooth animation */}
      <NFTDetailContent nft={nft} />
    </PageTransitionWrapper>
  );
}
