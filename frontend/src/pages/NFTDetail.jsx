import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Wallet, Clock, TrendingUp, ExternalLink, RefreshCw } from 'lucide-react';
import TierBadge from '../components/TierBadge';
import { useNFT } from '../hooks/useNFTData';
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

export default function NFTDetail() {
  const { tokenId } = useParams();
  const nft = useNFT(tokenId);
  const [claimLoading, setClaimLoading] = useState(false);

  if (!nft) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="text-gray-400 text-sm">NFT #{tokenId} not found.</p>
        <Link to="/dashboard" className="btn-ghost text-sm mt-6 inline-flex">← Back to collection</Link>
      </div>
    );
  }

  const cfg            = TIER_CONFIG[nft.tier] ?? TIER_CONFIG.COMMON;
  const borderClass    = `nft-border-${nft.tier.toLowerCase()}`;
  const upgradeHistory = nft.upgradeHistory ?? [];
  const claimable      = '0.042';
  const listPrice      = nft.listPrice;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-psl-muted hover:text-white font-body text-sm mb-8 transition-colors">
        <ArrowLeft size={13} /> Back to collection
      </Link>

      <div className="grid md:grid-cols-2 gap-8">

        {/* ── Left: Visual ── */}
        <div className="space-y-4">
          <div
            className={`card p-10 text-center relative overflow-hidden ${borderClass}`}
            style={{ boxShadow: `0 0 80px ${cfg.color}25, 0 0 160px ${cfg.color}10` }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 40%, ${cfg.color}18 0%, transparent 65%)` }} />
            <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: `linear-gradient(${cfg.color}08 1px, transparent 1px), linear-gradient(90deg, ${cfg.color}08 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
            <div className="relative z-10">
              <div className="text-8xl mb-5 inline-block animate-float" style={{ filter: `drop-shadow(0 0 20px ${cfg.color}50)` }}>
                {PLAYER_EMOJIS[nft.playerId] || '🏏'}
              </div>
              <div className="mb-4"><TierBadge tier={nft.tier} size="lg" /></div>
              <h1 className="font-display text-5xl text-white mb-1 tracking-wide">{nft.playerName}</h1>
              <p className="font-body font-semibold mb-1" style={{ color: cfg.color }}>{nft.moment}</p>
              <p className="text-gray-400 text-sm font-body italic">"{nft.stat}"</p>
              <p className="text-psl-muted text-xs font-body mt-1">{nft.matchContext}</p>
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
                  <p className="text-psl-gold font-semibold">${(nft.estimatedValue ?? 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Narrative */}
          {nft.narrative && (
            <div className="card p-6" style={{ borderColor: 'rgba(201,168,76,0.18)' }}>
              <p className="section-label mb-3">AI-Generated Narrative</p>
              <p className="text-gray-200 font-body leading-relaxed italic text-sm">"{nft.narrative}"</p>
              <div className="divider my-3" />
              <p className="section-label">claude-sonnet-4-20250514 · Generated on mint</p>
            </div>
          )}

          {/* ERC-6551 Wallet */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="text-psl-gold" size={15} />
              <p className="text-white font-body font-semibold text-sm">ERC-6551 Token Wallet</p>
              <span className="pill pill-live text-[0.55rem] ml-auto">Active</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-body">
                <span className="text-psl-muted">Claimable Yield</span>
                <span className="font-semibold text-psl-gold">{claimable} ETH</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-psl-muted">Accumulated</span>
                <span className="font-semibold text-green-400">+{claimable} ETH</span>
              </div>
            </div>
            <button
              disabled={claimLoading}
              className="mt-4 w-full py-2 text-sm bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition disabled:opacity-40"
              onClick={() => { setClaimLoading(true); setTimeout(() => setClaimLoading(false), 1500); }}
            >
              {claimLoading ? <RefreshCw size={13} className="inline animate-spin mr-1" /> : null}
              Claim Yield
            </button>
          </div>
        </div>

        {/* ── Right: Stats ── */}
        <div className="space-y-4">

          {/* Score breakdown */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl text-white">Performance Score</h2>
              <TierBadge tier={nft.tier} />
            </div>
            <div className="flex items-end gap-4 mb-7">
              <span className="font-display text-7xl leading-none" style={{ color: cfg.color, textShadow: `0 0 40px ${cfg.color}50` }}>
                {nft.score}
              </span>
              <span className="text-psl-muted font-body text-sm mb-2">/1000</span>
            </div>
            <div className="space-y-4">
              {Object.entries(nft.scoreComponents ?? {}).map(([key, val]) => {
                const meta = COMPONENT_LABELS[key];
                if (!meta) return null;
                const pct = (val / meta.max) * 100;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm font-body mb-2">
                      <span className="text-gray-300">{meta.label}</span>
                      <span className="font-semibold" style={{ color: cfg.color }}>
                        {val}<span className="text-psl-muted font-normal"> / {meta.max}</span>
                      </span>
                    </div>
                    <div className="progress-track">
                      <div className={`progress-fill bar-${nft.tier.toLowerCase()}`} style={{ width: `${pct}%` }} />
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
              <h2 className="font-display text-2xl text-white">Upgrade History</h2>
            </div>
            {upgradeHistory.length === 0 ? (
              <p className="text-gray-500 text-sm">No upgrades yet</p>
            ) : (
              <div className="space-y-4">
                {upgradeHistory.map((h, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <TierBadge tier={h.from} />
                        <TrendingUp size={12} className="text-psl-muted" />
                        <TierBadge tier={h.to} />
                      </div>
                      <div className="text-right">
                        <p className="section-label">{h.date ?? h.timestamp?.split('T')[0]}</p>
                        <p className="text-xs font-body text-gray-400 mt-0.5">Score: {h.score}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="card p-5">
            <h2 className="font-display text-xl text-white mb-4">Actions</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* ✅ Fixed: was a broken <button> followed by orphaned href/attributes */}
              <button className="btn-primary py-2.5 text-sm">
                {nft.listed ? `Listed · $${listPrice?.toLocaleString()}` : 'List for Sale'}
              </button>
              <a
                href={`https://sepolia.etherscan.io/token/${nft.tokenId}`}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost py-2.5 text-sm flex items-center justify-center gap-1.5"
              >
                <ExternalLink size={13} /> Etherscan
              </a>
            </div>
            <div className="px-4 py-3 text-center" style={{ background: 'rgba(26,107,60,0.12)', border: '1px solid rgba(26,107,60,0.25)' }}>
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