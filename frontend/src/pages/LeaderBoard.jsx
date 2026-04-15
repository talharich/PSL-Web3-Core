import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, Hash, AlertCircle, Trophy } from 'lucide-react';
import TierBadge from '../components/TierBadge';
import { nft as nftApi, marketplace as marketApi } from '../services/api';
import { MOCK_NFTS, TIER_CONFIG } from '../data/mockData';

const MEDAL = ['🥇', '🥈', '🥉'];

function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ]);
}

function getMockEntries() {
  return [...MOCK_NFTS]
    .sort((a, b) => b.score - a.score)
    .map(n => ({
      tokenId:          n.tokenId,
      playerId:         n.playerId,
      playerName:       n.playerName,
      tier:             n.tier,
      score:            n.score,
      performanceScore: n.score,
      stat:             n.stat,
    }));
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [limit,   setLimit]   = useState(20);
  const [stats,   setStats]   = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      withTimeout(nftApi.leaderboard(limit)),
      withTimeout(marketApi.stats()).catch(() => null),
    ])
      .then(([lb, st]) => {
        const arr = Array.isArray(lb) ? lb : (lb?.leaderboard ?? []);
        setEntries(arr.length > 0 ? arr : getMockEntries());
        setStats(st ?? null);
        setError(null);
      })
      .catch(() => {
        setEntries(getMockEntries());
        setError('Live data unavailable — showing demo leaderboard.');
      })
      .finally(() => setLoading(false));
  }, [limit]);

  const topThree = entries.slice(0, 3);
  const rest     = entries.slice(3);

  // Stats config — matches Marketplace's icon+color pattern
  const platformStats = [
    {
      label: 'Total Volume',
      value: stats ? `$${Number(stats.totalVolume ?? 0).toLocaleString()}` : '—',
      icon: TrendingUp,
      color: 'text-green-400',
    },
    {
      label: 'Active Listings',
      value: stats ? (stats.activeListings ?? entries.length) : entries.length,
      icon: Hash,
      color: 'text-blue-400',
    },
    {
      label: 'Royalties Paid',
      value: stats ? `$${Number(stats.royaltiesPaid ?? 0).toLocaleString()}` : '—',
      icon: DollarSign,
      color: 'text-amber-400',
    },
    {
      label: 'Total Minted',
      value: stats ? (stats.totalMinted ?? entries.length) : entries.length,
      icon: Trophy,
      color: 'text-psl-gold',
    },
  ];

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">

        {/* ── Header — matches Marketplace header pattern ── */}
        <div className="mb-8">
          <p className="text-green-400 tracking-widest text-xs mb-2">PSL × WEB3</p>
          <h1 className="text-5xl mb-3 font-bold bg-gradient-to-r from-green-400 via-emerald-300 to-green-600 bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-gray-400 text-sm">
            Top moments ranked by performance score
          </p>
        </div>

        {/* ── Platform Stats — icon + colored value, matches Marketplace ── */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {platformStats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-4 flex items-center gap-3">
                <Icon size={18} className={color} />
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className={`font-bold text-lg ${color}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Error banner — AlertCircle icon + backdrop-blur, matches Marketplace ── */}
        {error && !loading && (
          <div className="mb-6 p-4 flex items-center gap-3 backdrop-blur-md border border-amber-500/20 bg-amber-500/10">
            <AlertCircle size={16} className="text-amber-400 shrink-0" />
            <p className="text-amber-400 text-sm">
              {import.meta.env.DEV ? error : 'Live data unavailable — showing demo leaderboard.'}
            </p>
          </div>
        )}

        {/* ── Loading spinner ── */}
        {loading && (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Loading leaderboard...</p>
          </div>
        )}

        {/* ── Top 3 Podium ── */}
        {!loading && topThree.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8 items-end">
            {[topThree[1], topThree[0], topThree[2]].map((entry, idx) => {
              const rank      = idx === 1 ? 0 : idx === 0 ? 1 : 2;
              const cfg       = TIER_CONFIG[entry.tier ?? 'COMMON'] ?? TIER_CONFIG.COMMON;
              const isFirst   = rank === 0;
              const score     = entry.performanceScore ?? entry.score ?? 0;
              const initial   = (entry.playerName ?? entry.playerId ?? '#')[0].toUpperCase();

              return (
                <Link
                  key={entry.tokenId ?? idx}
                  to={`/nft/${entry.tokenId}`}
                  className="relative overflow-hidden flex flex-col items-center text-center cursor-pointer border backdrop-blur-md transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 group"
                  style={{
                    borderColor: `${cfg.color}40`,
                    background: `linear-gradient(160deg, ${cfg.color}14 0%, #060d0a 100%)`,
                    boxShadow: isFirst
                      ? `0 0 50px ${cfg.color}30, 0 20px 60px rgba(0,0,0,0.5)`
                      : `0 0 24px ${cfg.color}18, 0 10px 40px rgba(0,0,0,0.4)`,
                    paddingTop:    isFirst ? '2rem'   : '1.5rem',
                    paddingBottom: isFirst ? '1.5rem' : '1.25rem',
                    paddingLeft:  '1rem',
                    paddingRight: '1rem',
                  }}
                >
                  {/* Radial glow behind avatar */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-60 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(circle at 50% 30%, ${cfg.color}22, transparent 60%)`,
                    }}
                  />

                  {/* Border glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${cfg.color}18, transparent 55%)` }}
                  />

                  {/* Medal */}
                  <div className={`relative z-10 mb-3 ${isFirst ? 'text-4xl' : 'text-3xl'}`}>
                    {MEDAL[rank]}
                  </div>

                  {/* Avatar circle */}
                  <div
                    className="relative z-10 flex items-center justify-center rounded-full font-bold mb-3 transition-all duration-300 group-hover:scale-110"
                    style={{
                      width:      isFirst ? 64 : 52,
                      height:     isFirst ? 64 : 52,
                      fontSize:   isFirst ? 24 : 20,
                      background: `${cfg.color}18`,
                      border:     `2px solid ${cfg.color}60`,
                      color:       cfg.color,
                      boxShadow:  `0 0 20px ${cfg.color}40`,
                    }}
                  >
                    {initial}
                  </div>

                  {/* Name */}
                  <p className={`relative z-10 text-white font-semibold truncate w-full ${isFirst ? 'text-sm' : 'text-xs'}`}>
                    {entry.playerName ?? entry.playerId}
                  </p>

                  {/* Tier badge */}
                  <div className="relative z-10 mt-1.5">
                    <TierBadge tier={entry.tier ?? 'COMMON'} size="sm" />
                  </div>

                  {/* Score */}
                  <p
                    className="relative z-10 font-bold mt-2 leading-none"
                    style={{
                      fontSize:   isFirst ? '2rem' : '1.5rem',
                      color:       cfg.color,
                      textShadow: `0 0 16px ${cfg.color}88`,
                    }}
                  >
                    {score}
                  </p>
                  <p className="relative z-10 text-gray-500 text-[10px] mt-0.5 tracking-widest uppercase">pts</p>

                  {/* Bottom accent line */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px] transition-opacity duration-300 opacity-40 group-hover:opacity-100"
                    style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }}
                  />
                </Link>
              );
            })}
          </div>
        )}

        {/* Podium placeholder */}
        {!loading && topThree.length > 0 && topThree.length < 3 && (
          <div className="mb-8 text-center text-gray-500 text-sm">
            Not enough entries for a podium yet.
          </div>
        )}

        {/* ── Leaderboard table ── */}
        {!loading && (
          <>
            <div className="card overflow-hidden backdrop-blur-md bg-white/5">

              {/* Column headers */}
              <div className="grid grid-cols-[40px_1fr_auto_80px_1fr] gap-4 px-5 py-3 border-b border-white/10 text-xs text-gray-500 tracking-widest uppercase">
                <span>#</span>
                <span>Moment</span>
                <span>Tier</span>
                <span className="text-right">Score</span>
                <span>Bar</span>
              </div>

              {rest.map((entry, i) => {
                const cfg   = TIER_CONFIG[entry.tier ?? 'COMMON'] ?? TIER_CONFIG.COMMON;
                const score = entry.performanceScore ?? entry.score ?? 0;
                return (
                  <Link
                    key={entry.tokenId ?? i}
                    to={`/nft/${entry.tokenId}`}
                    className="grid grid-cols-[40px_1fr_auto_80px_1fr] gap-4 items-center px-5 py-3 border-b border-white/5 hover:bg-white/5 transition group"
                  >
                    <span className="text-gray-500 text-sm font-mono">{i + 4}</span>

                    <div>
                      <p className="text-white text-sm font-medium group-hover:text-green-400 transition-colors">
                        {entry.playerName ?? entry.playerId}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {entry.stat ?? entry.eventType} · #{entry.tokenId}
                      </p>
                    </div>

                    <TierBadge tier={entry.tier ?? 'COMMON'} size="sm" />

                    <span
                      className="font-bold text-right"
                      style={{ color: cfg.color }}
                    >
                      {score}
                    </span>

                    <div className="h-1.5 bg-white/10 overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min((score / 1000) * 100, 100)}%`,
                          background: cfg.color,
                          boxShadow: `0 0 6px ${cfg.color}88`,
                        }}
                      />
                    </div>
                  </Link>
                );
              })}

              {entries.length === 0 && (
                <div className="text-center py-24">
                  <p className="text-3xl text-gray-500 mb-2">No Entries Yet</p>
                  <p className="text-gray-500 text-sm">Check back soon for leaderboard data</p>
                </div>
              )}
            </div>

            {entries.length >= limit && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setLimit(l => l + 20)}
                  className="px-6 py-2.5 border border-white/20 text-gray-300 text-sm hover:border-green-400/50 hover:text-green-400 transition"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}