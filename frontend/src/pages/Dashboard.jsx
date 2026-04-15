import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Zap, TrendingUp, Wallet, Award } from 'lucide-react';
import NFTCard from '../components/NFTCard';
import TierBadge from '../components/TierBadge';
import PageTransitionWrapper from './PageTransitionWrapper'; // NEW: Import transition wrapper
import { useNFTList } from '../hooks/useNFTData';
import { TIER_CONFIG } from '../data/mockData';

/**
 * DashboardContent - Extracted content for cleaner separation
 * This allows PageTransitionWrapper to animate the entire page
 */
function DashboardContent({ nfts, pulse, lastUpdate }) {
  const totalValue = nfts.reduce((s, n) => s + n.estimatedValue, 0);

  const highestTier = ['ICON','LEGEND','EPIC','RARE','COMMON']
    .find(t => nfts.some(n => n.tier === t));

  const STATS = [
    {
      label: 'Portfolio Value',
      value: `$${totalValue.toLocaleString()}`,
      color: 'text-green-400',
      glow: 'rgba(34,197,94,0.25)',
      icon: Wallet
    },
    {
      label: 'Moments',
      value: nfts.length,
      color: 'text-white',
      glow: 'rgba(255,255,255,0.08)',
      icon: Award
    },
    {
      label: 'Top Tier',
      value: highestTier || '—',
      color: 'text-amber-400',
      glow: 'rgba(245,158,11,0.25)',
      icon: TrendingUp
    },
    {
      label: 'Last Update',
      value: new Date(lastUpdate).toLocaleTimeString(),
      color: 'text-green-300',
      glow: 'rgba(34,197,94,0.2)',
      icon: RefreshCw
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
        <div>
          <p className="text-green-400 text-xs tracking-widest">
            LIVE PORTFOLIO
          </p>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <h1 className="text-5xl font-bold text-white">
              My Collection
            </h1>

            {highestTier && (
              <TierBadge tier={highestTier} size="lg" />
            )}
          </div>

          <p className="text-gray-400 text-sm mt-2">
            Real-time NFT performance tracking system
          </p>
        </div>

        {/* LIVE STATUS */}
        <div
          className={`
            flex items-center gap-3 px-5 py-3
            border border-white/10 bg-white/5
            transition-all duration-300
            hover:scale-[1.02]
            ${pulse ? 'shadow-[0_0_30px_rgba(34,197,94,0.25)]' : ''}
          `}
        >
          <div className="w-2 h-2 bg-green-400 animate-pulse" style={{ borderRadius: '50%' }} />

          <span className="text-xs text-gray-300">
            Live Oracle Feed
          </span>

          <RefreshCw
            size={14}
            className={`${pulse ? 'animate-spin text-green-400' : 'text-gray-400'}`}
          />
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {STATS.map(({ label, value, color, glow, icon: Icon }) => (
          <div
            key={label}
            className="
              relative p-5
              bg-white/5
              border border-white/10
              transition-all duration-300
              hover:scale-[1.03]
              hover:border-white/20
              hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]
            "
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-400 tracking-widest">
                {label}
              </p>

              <div
                className="w-8 h-8 flex items-center justify-center"
                style={{
                  background: glow,
                  boxShadow: `0 0 20px ${glow}`
                }}
              >
                <Icon size={14} className={color} />
              </div>
            </div>

            <p className={`text-3xl font-bold ${color}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* PERFORMANCE */}
      <div className="p-6 bg-white/5 border border-white/10 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">
            Performance Scores
          </h2>

          <span className="text-xs text-green-400">
            LIVE UPDATING
          </span>
        </div>

        <div className="space-y-5">
          {nfts.map(nft => {
            const cfg = TIER_CONFIG[nft.tier];
            const pct = Math.min((nft.score / 1000) * 100, 100);

            return (
              <div
                key={nft.tokenId}
                className="
                  flex items-center gap-4
                  hover:bg-white/5
                  p-2
                  transition
                "
              >
                <span className="text-gray-300 w-44 truncate text-sm">
                  {nft.playerName}
                </span>

                <div className="flex-1 h-2 bg-white/10 overflow-hidden" style={{ borderRadius: '999px' }}>
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: cfg.color,
                      boxShadow: `0 0 10px ${cfg.color}`
                    }}
                  />
                </div>

                <span
                  className="font-bold text-lg w-16 text-right"
                  style={{ color: cfg.color }}
                >
                  {nft.score}
                </span>

                <TierBadge tier={nft.tier} />
              </div>
            );
          })}
        </div>
      </div>

      {/* NFT GRID */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">
          Your Moments
        </h2>

        <span className="text-xs text-gray-400">
          {nfts.length} assets
        </span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {nfts.map(nft => (
          <NFTCard key={nft.tokenId} nft={nft} />
        ))}
      </div>

      {/* FOOTER NOTE */}
      <div className="mt-10 p-5 border border-green-500/20 bg-green-500/5">
        <div className="flex gap-3 items-start">
          <Zap className="text-green-400 mt-1" size={16} />

          <div>
            <p className="text-green-400 font-semibold text-sm">
              Live Demo System
            </p>

            <p className="text-gray-400 text-sm mt-1">
              Use admin panel to trigger real-time NFT upgrades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const nfts = useNFTList();

  const [pulse, setPulse] = useState(false);
  const prevNFTs = useRef(nfts);
  const [lastUpdate] = useState(new Date());

  useEffect(() => {
    const changed = nfts.some(
      (n, i) => prevNFTs.current[i]?.tier !== n.tier
    );

    if (changed) {
      setPulse(true);
      setTimeout(() => setPulse(false), 1000);
    }

    prevNFTs.current = nfts;
  }, [nfts]);

  return (
    // NEW: Wrap dashboard with PageTransitionWrapper for smooth entrance
    <PageTransitionWrapper animationType="generic">
      <DashboardContent nfts={nfts} pulse={pulse} lastUpdate={lastUpdate} />
    </PageTransitionWrapper>
  );
}
