import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Award, Activity } from 'lucide-react';
import { PLAYERS, MOCK_NFTS } from '../data/mockData';
import TierBadge from '../components/TierBadge';
import NFTCard from '../components/NFTCard';
import { useNFTList } from '../hooks/useNFTData';

const MILESTONE_LABELS = {
  century:           'Century (100+ runs)',
  half_century:      'Half Century (50+ runs)',
  five_wicket_haul:  'Five Wicket Haul',
  hat_trick:         'Hat-Trick',
  player_of_match:   'Player of the Match',
  psl_title:         'PSL Title',
  national_squad:    'National Squad Selection',
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
  const player   = PLAYERS.find(p => p.id === playerId);
  const playerNFTs = allNFTs.filter(n => n.playerId === playerId);

  if (!player) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="font-display text-3xl text-psl-muted mb-4">Player Not Found</p>
        <Link to="/" className="btn-ghost text-sm">← Home</Link>
      </div>
    );
  }

  const maxForm    = Math.max(...player.recentForm);
  const avgForm    = Math.round(player.recentForm.reduce((a,b) => a+b, 0) / player.recentForm.length);
  const totalPts   = player.milestones.reduce((s, m) => s + (MILESTONE_POINTS[m] || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">

      <Link
        to="/marketplace"
        className="inline-flex items-center gap-2 text-psl-muted hover:text-white font-body text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={13} /> Back
      </Link>

      {/* Player header */}
      <div
        className="card p-8 mb-8 flex items-center gap-6 relative overflow-hidden"
        style={{ borderColor: 'rgba(201,168,76,0.2)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 0% 50%, rgba(26,107,60,0.15) 0%, transparent 70%)' }}
        />
        <div
          className="w-24 h-24 flex items-center justify-center text-5xl shrink-0"
          style={{
            background: 'rgba(26,107,60,0.2)',
            border: '1px solid rgba(37,146,79,0.35)',
            boxShadow: '0 0 30px rgba(26,107,60,0.3)',
          }}
        >
          {PLAYER_EMOJIS[player.id] || '🏏'}
        </div>
        <div className="relative z-10">
          <h1 className="font-display text-5xl text-white mb-1">{player.name}</h1>
          <p className="text-psl-gold font-body font-medium">{player.team}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="pill pill-live">{player.role}</span>
            <span className="text-psl-muted text-xs font-body">
              {playerNFTs.length} moment{playerNFTs.length !== 1 ? 's' : ''} minted
            </span>
          </div>
        </div>
        <div className="ml-auto hidden md:flex gap-6 relative z-10">
          {[
            { label: 'Avg Form', value: avgForm, color: 'text-psl-gold' },
            { label: 'Milestone Pts', value: totalPts, color: 'text-blue-400' },
            { label: 'Trade Vol', value: player.tradeVolume, color: 'text-green-400' },
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
          <div className="flex items-end gap-3 h-36">
            {player.recentForm.map((score, i) => {
              const h     = (score / 100) * 100;
              const isMax = score === maxForm;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span
                    className="text-xs font-body font-semibold"
                    style={{ color: isMax ? 'var(--psl-gold)' : 'var(--psl-muted)' }}
                  >
                    {score}
                  </span>
                  <div
                    className="w-full transition-all duration-700"
                    style={{
                      height: `${h}%`,
                      background: isMax
                        ? 'linear-gradient(180deg, #e0bb6a, #c9a84c)'
                        : 'linear-gradient(180deg, #25924f, #1a6b3c)',
                      boxShadow: isMax ? '0 0 12px rgba(201,168,76,0.5)' : 'none',
                    }}
                  />
                  <span className="text-psl-muted text-[0.65rem] font-body">M{i + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestones */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Award className="text-psl-gold" size={16} />
            <h2 className="font-display text-2xl text-white">Career Milestones</h2>
          </div>
          <div className="space-y-3">
            {player.milestones.map(m => (
              <div
                key={m}
                className="flex items-center justify-between p-3 transition-colors hover:bg-psl-green-muted/40"
                style={{ border: '1px solid rgba(26,107,60,0.25)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2 h-2 shrink-0"
                    style={{
                      background: 'var(--psl-green-light)',
                      boxShadow: '0 0 6px rgba(37,146,79,0.7)',
                      borderRadius: '50%',
                    }}
                  />
                  <span className="text-gray-300 text-sm font-body">
                    {MILESTONE_LABELS[m] || m}
                  </span>
                </div>
                <span className="text-psl-gold text-sm font-semibold font-body shrink-0">
                  +{MILESTONE_POINTS[m]} pts
                </span>
              </div>
            ))}
          </div>
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