import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Check, TrendingUp, DollarSign, List, AlertCircle } from 'lucide-react';
import NFTCard from '../components/NFTCard';
import { useMarketListings, useMarketStats } from '../hooks/useNFTData';
import { payment as paymentApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import { TIER_CONFIG } from '../data/mockData';

const TIERS = ['All', 'ICON', 'LEGEND', 'EPIC', 'RARE', 'COMMON'];
const SORTS = ['Score: High', 'Price: Low', 'Price: High', 'Newest'];

export default function Marketplace() {
  const { listings, loading, error } = useMarketListings();
  const { stats } = useMarketStats();
  const { isLoggedIn } = useAuth();

  const [search,   setSearch]   = useState('');
  const [tier,     setTier]     = useState('All');
  const [sort,     setSort]     = useState('Score: High');
  const [bought,   setBought]   = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [buying,   setBuying]   = useState(null);

  const filtered = useMemo(() => {
    return listings
      .filter(n => tier === 'All' || n.tier === tier)
      .filter(n =>
        (n.playerName ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (n.moment ?? '').toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (sort === 'Price: Low')  return (a.listPrice ?? a.estimatedValue ?? 0) - (b.listPrice ?? b.estimatedValue ?? 0);
        if (sort === 'Price: High') return (b.listPrice ?? b.estimatedValue ?? 0) - (a.listPrice ?? a.estimatedValue ?? 0);
        if (sort === 'Score: High') return b.score - a.score;
        return 0;
      });
  }, [listings, tier, search, sort]);

  const handleBuy = async (nft) => {
    if (!isLoggedIn) { setShowAuth(true); return; }
    const eventId = nft.eventId ?? nft.tokenId;
    if (!eventId) return;
    setBuying(nft.tokenId);
    try {
      await paymentApi.demoConfirm(String(eventId));
      setBought(nft);
      setTimeout(() => setBought(null), 3500);
    } catch (err) {
      if (err.message?.includes('401') || err.message?.toLowerCase().includes('unauthorized')) {
        setShowAuth(true);
      }
    } finally {
      setBuying(null);
    }
  };

  const platformStats = [
    { label: 'Total Volume',    value: stats ? `$${Number(stats.totalVolume ?? 0).toLocaleString()}` : '—', icon: TrendingUp, color: 'text-green-400' },
    { label: 'Royalties Paid',  value: stats ? `$${Number(stats.royaltiesPaid ?? 0).toLocaleString()}` : '—', icon: DollarSign, color: 'text-amber-400' },
    { label: 'Active Listings', value: stats ? (stats.activeListings ?? listings.length) : listings.length, icon: List, color: 'text-blue-400' },
  ];

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-green-400 tracking-widest text-xs mb-2">SECONDARY MARKET</p>
          <h1 className="text-5xl mb-3 font-bold bg-gradient-to-r from-green-400 via-emerald-300 to-green-600 bg-clip-text text-transparent">
            Marketplace
          </h1>
          <p className="text-gray-400 text-sm">
            {listings.length} moments listed · 85 / 10 / 5 royalty split on every trade
          </p>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
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

        {/* Backend error notice — shown only when falling back to demo data */}
        {error && (
          <div className="mb-6 p-4 flex items-center gap-3 border border-amber-500/20 bg-amber-500/10">
            <AlertCircle size={16} className="text-amber-400 shrink-0" />
            <p className="text-amber-400 text-sm">
              Live marketplace unavailable — showing demo data.
              {import.meta.env.DEV && (
                <span className="text-amber-500/60 ml-2 text-xs font-mono">{error}</span>
              )}
            </p>
          </div>
        )}

        {/* Success Banner */}
        {bought && (
          <div className="mb-7 p-4 flex items-center gap-3 backdrop-blur-md bg-green-400/10 border border-green-400/30 shadow-lg animate-slide-up">
            <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: 'rgba(34,197,94,0.2)', boxShadow: '0 0 25px rgba(34,197,94,0.6)' }}>
              <Check size={18} className="text-green-400" />
            </div>
            <div>
              <p className="text-green-400 font-semibold text-sm">Purchase Successful!</p>
              <p className="text-gray-400 text-sm">{bought.playerName} — {bought.moment}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-400 transition" size={16} />
            <input
              type="text"
              placeholder="Search player or moment..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 focus:border-green-400 focus:ring-2 focus:ring-green-400/30 outline-none transition-all"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {TIERS.map(t => {
              const cfg = t !== 'All' ? TIER_CONFIG[t] : null;
              const isActive = tier === t;
              return (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className="px-4 py-2 text-sm font-medium border transition-all"
                  style={isActive && cfg
                    ? { borderColor: cfg.color, color: cfg.color, background: `${cfg.color}22`, boxShadow: `0 0 20px ${cfg.color}44` }
                    : { borderColor: 'rgba(255,255,255,0.1)', color: '#9ca3af' }}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 focus:border-green-400 outline-none transition"
          >
            {SORTS.map(s => <option key={s} value={s} style={{ background: '#05060a' }}>{s}</option>)}
          </select>
        </div>

        {/* Royalty Bar */}
        <div className="p-4 mb-8 flex items-center gap-4 backdrop-blur-md bg-white/5 border border-green-400/20">
          <SlidersHorizontal className="text-green-400" size={18} />
          <p className="text-gray-400 text-sm">
            Every purchase executes automatically:
            <span className="text-green-400 font-semibold ml-2">85% → Seller</span>
            <span className="mx-2">·</span>
            <span className="text-emerald-400 font-semibold">10% → Player</span>
            <span className="mx-2">·</span>
            <span className="text-lime-400 font-semibold">5% → Platform</span>
          </p>
        </div>

        {/* ── Content area: exactly one of these three states renders ── */}

        {/* 1. First-load spinner — only while loading AND no data yet */}
        {loading && listings.length === 0 && (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Loading marketplace...</p>
          </div>
        )}

        {/* 2. No data after load completed */}
        {!loading && listings.length === 0 && (
          <div className="text-center py-24">
            <p className="text-3xl text-gray-500 mb-2">No Listings Yet</p>
            <p className="text-gray-500 text-sm">Check back soon for available moments</p>
          </div>
        )}

        {/* 3. Grid — render as soon as we have any data, even if still polling */}
        {listings.length > 0 && (
          filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-3xl text-gray-500 mb-2">No Moments Found</p>
              <p className="text-gray-500 text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(nft => (
                <NFTCard
                  key={nft.tokenId}
                  nft={nft}
                  showBuy
                  onBuy={handleBuy}
                  buyingTokenId={buying}
                />
              ))}
            </div>
          )
        )}

      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}