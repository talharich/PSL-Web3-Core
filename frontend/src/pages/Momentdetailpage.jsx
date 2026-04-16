import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, ExternalLink, TrendingUp, Wallet, Clock } from 'lucide-react';
import TierBadge from '../components/TierBadge';
import ScoreBar from '../components/ScoreBar';
import { nft as nftApi, marketplace as marketApi } from '../services/api';
import { normaliseToken } from '../hooks/useNFTData';
import { TIER_CONFIG } from '../data/mockData';

const TIER_BG = {
  COMMON: 'linear-gradient(160deg, rgba(107,114,128,0.08) 0%, transparent 60%)',
  RARE:   'linear-gradient(160deg, rgba(59,130,246,0.1)   0%, transparent 60%)',
  EPIC:   'linear-gradient(160deg, rgba(168,85,247,0.1)   0%, transparent 60%)',
  LEGEND: 'linear-gradient(160deg, rgba(245,158,11,0.12)  0%, transparent 60%)',
  ICON:   'linear-gradient(160deg, rgba(239,68,68,0.12)   0%, transparent 60%)',
};

export default function MomentDetailPage() {
  const { tokenId }  = useParams();
  const prevTierRef  = useRef(null);

  const [token,     setToken]     = useState(null);
  const [history,   setHistory]   = useState([]);
  const [yieldData, setYieldData] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [upgraded,  setUpgraded]  = useState(false);

  const fetchAllRef = useRef(null);

  const fetchAll = () => {
    Promise.all([
      nftApi.token(tokenId),
      marketApi.tokenHistory(tokenId).catch(() => ({ history: [] })),
      marketApi.yield(tokenId).catch(() => ({ claimableEth: '0' })),
    ]).then(([tok, hist, yld]) => {
      const normalised = normaliseToken(tok);

      // detect tier upgrade
      if (prevTierRef.current && prevTierRef.current !== normalised.tier) {
        setUpgraded(true);
        setTimeout(() => setUpgraded(false), 2000);
      }
      prevTierRef.current = normalised.tier;

      setToken(normalised);
      setHistory(Array.isArray(hist) ? hist : (hist?.history ?? []));
      setYieldData(yld);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  // Keep ref up to date so the interval always calls the latest version
  fetchAllRef.current = fetchAll;

  useEffect(() => {
    fetchAllRef.current();
    const interval = setInterval(() => fetchAllRef.current(), 3000);
    return () => clearInterval(interval);
  }, [tokenId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-green-400 text-sm tracking-widest">Loading moment...</p>
      </div>
    </div>
  );

  if (!token) return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <p className="text-gray-400 mb-6">Moment not found.</p>
      <Link to="/marketplace" className="btn-ghost">← Back to Marketplace</Link>
    </div>
  );

  const tier = token.tier ?? 'COMMON';
  const cfg  = TIER_CONFIG[tier] ?? TIER_CONFIG.COMMON;
  const claimableEth = yieldData?.claimableEth ?? '0';

  return (
    <div className="animate-fade-in">

      {/* ── Hero band ── */}
      <div
        className="relative pt-14 pb-10 overflow-hidden border-b border-white/10"
        style={{ background: TIER_BG[tier] }}
      >
        {/* upgrade flash */}
        {upgraded && (
          <div className="absolute inset-0 pointer-events-none z-20 animate-fade-in"
            style={{ background: `radial-gradient(circle at 50% 50%, ${cfg.color}30, transparent 65%)` }} />
        )}

        <div className="max-w-5xl mx-auto px-6">
          <Link to="/marketplace"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-8 transition">
            <ArrowLeft size={13} /> Back to Marketplace
          </Link>

          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Card visual */}
            <div className="shrink-0">
              <div
                className="w-52 h-64 flex flex-col items-center justify-center relative overflow-hidden border"
                style={{
                  background: `linear-gradient(145deg, ${cfg.color}15, rgba(0,0,0,0.6))`,
                  borderColor: `${cfg.color}50`,
                  boxShadow: upgraded ? `0 0 80px ${cfg.color}60` : `0 0 40px ${cfg.color}25`,
                  transition: 'box-shadow 0.5s ease',
                }}
              >
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: `linear-gradient(${cfg.color}08 1px, transparent 1px), linear-gradient(90deg,${cfg.color}08 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
                <div className="text-6xl mb-3 relative z-10" style={{ filter: `drop-shadow(0 0 16px ${cfg.color}60)` }}>
                  {token.playerName?.[0] ?? '?'}
                </div>
                <TierBadge tier={tier} size="lg" />
                <p className="text-[10px] font-mono text-gray-500 mt-3 relative z-10">#{token.tokenId}</p>
                <div className="flex items-center gap-1.5 absolute top-3 right-3">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[9px] text-gray-400">LIVE</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="font-display text-6xl text-white leading-none mb-1">{token.playerName}</h1>
              <p className="font-semibold mb-1 text-lg" style={{ color: cfg.color }}>{token.moment}</p>
              <p className="text-gray-400 text-sm italic mb-1">"{token.stat}"</p>
              <p className="text-gray-600 text-xs mb-5">{token.matchContext}</p>

              {token.narrative && (
                <div className="p-4 mb-5 border-l-2 text-sm text-gray-300 italic leading-relaxed"
                  style={{ borderColor: `${cfg.color}60`, background: `${cfg.color}06` }}>
                  "{token.narrative}"
                  <p className="text-[10px] text-gray-600 mt-2 not-italic">claude-sonnet-4-20250514 · Generated on mint</p>
                </div>
              )}

              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="section-label">Performance Score</span>
                  <span className="font-bold text-lg" style={{ color: cfg.color }}>{token.score}/1000</span>
                </div>
                <ScoreBar score={token.score} tier={tier} showLabel={false} />
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <RefreshCw size={11} className="text-green-400" />
                Live · updating every 3s via oracle polling
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-6">

          {/* Main content */}
          <div className="md:col-span-2 space-y-5">

            {/* On-chain data */}
            <div className="card p-6">
              <h3 className="font-display text-xl text-white mb-4">On-Chain Data</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Token ID',   `#${token.tokenId}`],
                  ['Standard',   'ERC-721 + ERC-6551'],
                  ['Network',    'Sepolia'],
                  ['Tier',       tier],
                  ['Mint Rarity',`${token.mintRarity}%`],
                  ['Score',      `${token.score} / 1000`],
                ].map(([label, value]) => (
                  <div key={label} className="p-3 bg-white/3 border border-white/8">
                    <p className="section-label mb-1">{label}</p>
                    <p className="text-white text-sm font-mono">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Score components */}
            {token.scoreComponents && Object.keys(token.scoreComponents).length > 0 && (
              <div className="card p-6">
                <h3 className="font-display text-xl text-white mb-4">Score Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { key: 'form',       label: 'Recent Form',       max: 400 },
                    { key: 'milestone',  label: 'Career Milestones', max: 250 },
                    { key: 'popularity', label: 'Trade Popularity',  max: 200 },
                    { key: 'rarity',     label: 'Mint Rarity',       max: 150 },
                  ].map(({ key, label, max }) => {
                    const val = token.scoreComponents[key] ?? 0;
                    const pct = (val / max) * 100;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gray-300">{label}</span>
                          <span className="font-semibold" style={{ color: cfg.color }}>
                            {val}<span className="text-gray-600 font-normal"> / {max}</span>
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/10 overflow-hidden">
                          <div className="h-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: cfg.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upgrade history */}
            {token.upgradeHistory?.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={15} className="text-gray-400" />
                  <h3 className="font-display text-xl text-white">Upgrade History</h3>
                </div>
                <div className="space-y-3">
                  {token.upgradeHistory.map((h, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-2">
                        <TierBadge tier={h.from} size="sm" />
                        <TrendingUp size={12} className="text-gray-500" />
                        <TierBadge tier={h.to} size="sm" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-mono">{h.date ?? h.timestamp?.split('T')[0]}</p>
                        <p className="text-xs text-gray-600">Score: {h.score}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sale history */}
            {history.length > 0 && (
              <div className="card p-6">
                <h3 className="font-display text-xl text-white mb-4">Sale History</h3>
                <div className="space-y-2">
                  {history.map((sale, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 text-sm">
                      <span className="text-gray-400">{sale.type ?? 'Sale'}</span>
                      <span className="text-green-400 font-semibold">${sale.price?.toLocaleString()}</span>
                      <span className="text-gray-600 text-xs">{sale.date ? new Date(sale.date).toLocaleDateString() : '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* ERC-6551 yield */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Wallet size={14} className="text-amber-400" />
                <h3 className="text-white font-semibold text-sm">ERC-6551 Wallet</h3>
                <span className="ml-auto text-[9px] px-2 py-0.5 border border-green-400/30 text-green-400">ACTIVE</span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Claimable Yield</span>
                  <span className="font-semibold text-amber-400">{claimableEth} ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Estimated Value</span>
                  <span className="text-green-400">${(token.estimatedValue ?? 0).toLocaleString()}</span>
                </div>
              </div>
              <button
                disabled={Number(claimableEth) === 0}
                className="w-full py-2 text-sm border text-sm font-semibold transition disabled:opacity-40"
                style={{
                  borderColor: `${cfg.color}40`,
                  color: cfg.color,
                  background: `${cfg.color}08`,
                }}
              >
                Claim {claimableEth} ETH
              </button>
            </div>

            {/* Royalties */}
            <div className="card p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Royalty Split</h3>
              {[['Seller', '85%', 'text-white'], ['Player Royalty', '10%', 'text-blue-400'], ['Platform', '5%', 'text-green-400']].map(([k, v, c]) => (
                <div key={k} className="flex justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-gray-400">{k}</span>
                  <span className={`font-bold ${c}`}>{v}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="card p-5 space-y-3">
              <h3 className="text-white font-semibold text-sm mb-3">Actions</h3>
              <button className="w-full py-2.5 text-sm font-semibold transition hover:scale-[1.02]"
                style={{ background: cfg.color, color: '#000' }}>
                {token.listed ? `Listed · $${token.listPrice?.toLocaleString()}` : 'List for Sale'}
              </button>
              <a
                href={`https://sepolia.etherscan.io/token/${token.tokenId}`}
                target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm border border-white/15 text-gray-300 hover:border-white/30 hover:text-white transition"
              >
                <ExternalLink size={12} /> View on Etherscan
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
