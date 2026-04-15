import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp, Award, Activity } from 'lucide-react';
import { PLAYERS, MOCK_NFTS } from '../data/mockData';
import TierBadge from '../components/TierBadge';
import NFTCard from '../components/NFTCard';
import { useNFTList } from '../hooks/useNFTData';
import { nft as nftApi } from '../services/api';

const MILESTONE_LABELS = {
  century: 'Century (100+ runs)', half_century: 'Half Century (50+ runs)',
  five_wicket_haul: 'Five Wicket Haul', hat_trick: 'Hat-Trick',
  player_of_match: 'Player of the Match', psl_title: 'PSL Title',
  national_squad: 'National Squad Selection',
};
const MILESTONE_POINTS = {
  century: 80, half_century: 30, five_wicket_haul: 90,
  hat_trick: 100, player_of_match: 40, psl_title: 150, national_squad: 50,
};
const PLAYER_EMOJIS = {
  'babar-azam': '🏏', 'shaheen-afridi': '🎳',
  'mohammad-rizwan': '🧤', 'fakhar-zaman': '💥',
};

export default function PlayerStats() {
  const { playerId } = useParams();
  const allNFTs  = useNFTList();

  // Try to load live stats from backend
  const [liveStats, setLiveStats] = useState(null);
  const [liveTokens, setLiveTokens] = useState(null);

  useEffect(() => {
    nftApi.playerStats(playerId)
      .then(setLiveStats)
      .catch(() => {});
    nftApi.playerTokens(playerId)
      .then(d => setLiveTokens(Array.isArray(d) ? d : (d.tokens ?? null)))
      .catch(() => {});
  }, [playerId]);

  const player   = PLAYERS.find(p => p.id === playerId);
  const playerNFTs = liveTokens ?? allNFTs.filter(n => n.playerId === playerId);

  // Use live stats if available, otherwise fall back to static mock player data
  const recentForm = liveStats?.recentForm ?? player?.recentForm ?? [];
  const milestones = liveStats?.milestones ?? player?.milestones ?? [];
  const tradeVolume = liveStats?.tradeVolume ?? player?.tradeVolume ?? 0;

  if (!player && !liveStats) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading player stats...</p>
        <Link to="/" className="btn-ghost text-sm mt-6 inline-flex">← Home</Link>
      </div>
    );
  }

  const displayName = liveStats?.name ?? player?.name ?? playerId;
  const displayTeam = liveStats?.team ?? player?.team ?? '';
  const displayRole = liveStats?.role ?? player?.role ?? '';

  const maxForm  = recentForm.length ? Math.max(...recentForm) : 100;
  const avgForm  = recentForm.length ? Math.round(recentForm.reduce((a, b) => a + b, 0) / recentForm.length) : 0;
  const totalPts = milestones.reduce((s, m) => s + (MILESTONE_POINTS[typeof m === 'string' ? m : m.type] || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">
      <Link to="/marketplace" className="inline-flex items-center gap-2 text-psl-muted hover:text-white font-body text-sm mb-8 transition-colors">
        <ArrowLeft size={13} /> Back
      </Link>

      {/* Player header */}
      <div className="card p-8 mb-8 flex items-center gap-6 relative overflow-hidden" style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 80% at 0% 50%, rgba(26,107,60,0.15) 0%, transparent 70%)' }} />
        <div
          className="w-24 h-24 flex items-center justify-center text-5xl shrink-0"
          style={{ background: 'rgba(26,107,60,0.2)', border: '1px solid rgba(37,146,79,0.35)', boxShadow: '0 0 30px rgba(26,107,60,0.3)' }}
        >
          {PLAYER_EMOJIS[playerId] || '🏏'}
        </div>
        <div className="relative z-10">
          <h1 className="font-display text-5xl text-white mb-1">{displayName}</h1>
          <p className="text-psl-gold font-body font-medium">{displayTeam}</p>
          <div className="flex items-center gap-4 mt-2">
            {displayRole && <span className="pill pill-live">{displayRole}</span>}
            <span className="text-psl-muted text-xs font-body">{playerNFTs.length} moment{playerNFTs.length !== 1 ? 's' : ''} minted</span>
          </div>
        </div>
        <div className="ml-auto hidden md:flex gap-6 relative z-10">
          {[
            { label: 'Avg Form',      value: avgForm,     color: 'text-psl-gold'  },
            { label: 'Milestone Pts', value: totalPts,    color: 'text-blue-400'  },
            { label: 'Trade Vol',     value: tradeVolume, color: 'text-green-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p className={`font-display text-3xl ${color}`}>{value}</p>
              <p className="section-label mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Form chart */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="text-psl-gold" size={16} />
            <h2 className="font-display text-2xl text-white">Recent Form</h2>
            <span className="ml-auto text-psl-muted text-xs font-body">Last 5 matches</span>
          </div>
          {recentForm.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent form data</p>
          ) : (
            <div className="flex items-end gap-3 h-36">
              {recentForm.map((score, i) => {
                const h = (score / 100) * 100;
                const isMax = score === maxForm;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-xs font-body font-semibold" style={{ color: isMax ? 'var(--psl-gold)' : 'var(--psl-muted)' }}>{score}</span>
                    <div
                      className="w-full transition-all duration-700"
                      style={{
                        height: `${h}%`,
                        background: isMax ? 'linear-gradient(180deg, #e0bb6a, #c9a84c)' : 'linear-gradient(180deg, #25924f, #1a6b3c)',
                        boxShadow: isMax ? '0 0 12px rgba(201,168,76,0.5)' : 'none',
                      }}
                    />
                    <span className="text-psl-muted text-[0.65rem] font-body">M{i + 1}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Milestones */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Award className="text-psl-gold" size={16} />
            <h2 className="font-display text-2xl text-white">Career Milestones</h2>
          </div>
          {milestones.length === 0 ? (
            <p className="text-gray-500 text-sm">No milestones data</p>
          ) : (
            <div className="space-y-3">
              {milestones.map((m, idx) => {
                const key = typeof m === 'string' ? m : m.type;
                return (
                  <div key={idx} className="flex items-center justify-between p-3 transition-colors hover:bg-psl-green-muted/40" style={{ border: '1px solid rgba(26,107,60,0.25)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 shrink-0" style={{ background: 'var(--psl-green-light)', boxShadow: '0 0 6px rgba(37,146,79,0.7)', borderRadius: '50%' }} />
                      <span className="text-gray-300 text-sm font-body">{MILESTONE_LABELS[key] || key}</span>
                    </div>
                    <span className="text-psl-gold text-sm font-semibold font-body shrink-0">+{MILESTONE_POINTS[key] ?? 0} pts</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Player's NFTs */}
      {playerNFTs.length > 0 && (
        <>
          <h2 className="font-display text-3xl text-white mb-5">Minted Moments</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {playerNFTs.map(nft => <NFTCard key={nft.tokenId} nft={nft} />)}
          </div>
        </>
      )}
    </div>
  );
}