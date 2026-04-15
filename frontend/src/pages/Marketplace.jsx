import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Check } from 'lucide-react';
import NFTCard from '../components/NFTCard';
import { useNFTList } from '../hooks/useNFTData';
import { TIER_CONFIG } from '../data/mockData';

const TIERS  = ['All', 'ICON', 'LEGEND', 'EPIC', 'RARE', 'COMMON'];
const SORTS  = ['Score: High', 'Price: Low', 'Price: High', 'Newest'];

export default function Marketplace() {
  const allNFTs = useNFTList();
  const [search, setSearch] = useState('');
  const [tier,   setTier]   = useState('All');
  const [sort,   setSort]   = useState('Score: High');
  const [bought, setBought] = useState(null);

  const listed = useMemo(() => allNFTs.filter(n => n.listed), [allNFTs]);

  const filtered = useMemo(() => {
    return listed
      .filter(n => tier === 'All' || n.tier === tier)
      .filter(n =>
        n.playerName.toLowerCase().includes(search.toLowerCase()) ||
        n.moment.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (sort === 'Price: Low')  return (a.listPrice || 0) - (b.listPrice || 0);
        if (sort === 'Price: High') return (b.listPrice || 0) - (a.listPrice || 0);
        if (sort === 'Score: High') return b.score - a.score;
        return 0;
      });
  }, [listed, tier, search, sort]);

  const handleBuy = (nft) => {
    setBought(nft);
    setTimeout(() => setBought(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">

      {/* Header */}
      <div className="mb-10">
        <p className="section-label mb-2">Secondary Market</p>

        <h1 className="font-display text-5xl text-white mb-3">
          Marketplace
        </h1>

        <p className="text-gray-400 text-sm">
          {listed.length} moments listed · 85 / 10 / 5 royalty split on every trade
        </p>
      </div>

      {/* Success Banner */}
      {bought && (
        <div className="mb-7 p-4 flex items-center gap-3 backdrop-blur-md bg-green-400/10 border border-green-400/30 shadow-lg animate-slide-up hover:scale-[1.02] transition-all duration-300">

          <div
            className="w-10 h-10 flex items-center justify-center shrink-0"
            style={{
              background: 'rgba(34,197,94,0.2)',
              boxShadow: '0 0 25px rgba(34,197,94,0.6)'
            }}
          >
            <Check size={18} className="text-green-400" />
          </div>

          <div>
            <p className="text-green-400 font-semibold text-sm">Purchase Successful!</p>
            <p className="text-gray-400 text-sm">
              {bought.playerName} — {bought.moment}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">

        {/* Search */}
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-400 transition duration-300" size={16} />

          <input
            type="text"
            placeholder="Search player or moment..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10
            focus:border-green-400 focus:ring-2 focus:ring-green-400/30
            hover:border-green-400/40 outline-none transition-all duration-300
            hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]"
          />
        </div>

        {/* Tier Filters */}
        <div className="flex gap-2 flex-wrap">
          {TIERS.map(t => {
            const cfg = t !== 'All' ? TIER_CONFIG[t] : null;
            const isActive = tier === t;

            return (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={`px-4 py-2 text-sm font-medium border transition-all duration-300
                  ${isActive
                    ? 'scale-110 shadow-lg'
                    : 'hover:scale-110 hover:shadow-lg hover:-translate-y-1'
                  }`}
                style={
                  isActive && cfg
                    ? {
                        borderColor: `${cfg.color}`,
                        color: cfg.color,
                        background: `${cfg.color}22`,
                        boxShadow: `0 0 20px ${cfg.color}66`
                      }
                    : {
                        borderColor: 'rgba(255,255,255,0.1)'
                      }
                }
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10
          hover:border-green-400/40 focus:border-green-400
          outline-none transition-all duration-300
          hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]"
        >
          {SORTS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Royalty Bar */}
      <div className="p-4 mb-8 flex items-center gap-4 backdrop-blur-md
      bg-white/5 border border-green-400/20 hover:border-green-400/40
      transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]">

        <SlidersHorizontal className="text-green-400" size={18} />

        <p className="text-gray-400 text-sm">
          Every purchase automatically executes:
          <span className="text-green-400 font-semibold ml-2">85% → Seller</span>
          <span className="mx-2">·</span>
          <span className="text-emerald-400 font-semibold">10% → Player</span>
          <span className="mx-2">·</span>
          <span className="text-lime-400 font-semibold">5% → Platform</span>
        </p>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-3xl text-gray-500 mb-2">No Moments Found</p>
          <p className="text-gray-500 text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(nft => (
            <div
              key={nft.tokenId}
              className="transition-all duration-500 transform
              hover:scale-[1.06] hover:-translate-y-3
              hover:shadow-[0_25px_50px_rgba(34,197,94,0.25)]"
            >
              <NFTCard nft={nft} showBuy onBuy={handleBuy} />
            </div>
          ))}
        </div>
      )}

    </div>
  );
}