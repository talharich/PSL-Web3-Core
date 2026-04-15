import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Wallet, Award, TrendingUp, LogOut, Copy, Check, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { nft as nftApi } from '../services/api';
import TierBadge from '../components/TierBadge';
import NFTCard from '../components/NFTCard';
import { TIER_CONFIG } from '../data/mockData';

export default function ProfilePage() {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [copied,    setCopied]    = useState(false);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      nftApi.portfolio(user.id)
        .then(setPortfolio)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, user]);

  const handleLogout = () => { logout(); navigate('/'); };

  const copyAddress = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tokens      = portfolio?.tokens ?? [];
  const totalValue  = portfolio?.estimatedValueUsd ?? 0;
  const highestTier = portfolio?.highestTier ?? 'COMMON';
  const tokenCount  = portfolio?.tokenCount ?? tokens.length;
  const cfg         = TIER_CONFIG[highestTier] ?? TIER_CONFIG.COMMON;

  if (!isLoggedIn) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center border border-white/10 bg-white/5">
          <User size={32} className="text-gray-400" />
        </div>
        <h1 className="font-display text-4xl text-white mb-3">Sign In Required</h1>
        <p className="text-gray-400 text-sm mb-8">Sign in to view your profile and collection.</p>
        <Link to="/" className="btn-primary px-8 py-3">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">
      <div className="card p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 80% at 0% 50%, ${cfg.color}12 0%, transparent 70%)` }} />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 flex items-center justify-center text-3xl font-bold shrink-0"
            style={{ background: `${cfg.color}15`, border: `2px solid ${cfg.color}40`, color: cfg.color }}>
            {(user?.displayName ?? user?.email ?? 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-5xl text-white leading-none mb-1 truncate">
              {user?.displayName ?? user?.email?.split('@')[0]}
            </h1>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            {user?.walletAddress ? (
              <button onClick={copyAddress} className="mt-2 flex items-center gap-2 text-xs text-gray-500 hover:text-white transition">
                <Wallet size={11} className="text-green-400" />
                <span className="font-mono">{user.walletAddress.slice(0,8)}...{user.walletAddress.slice(-6)}</span>
                {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
              </button>
            ) : (
              <span className="mt-2 flex items-center gap-2 text-xs text-gray-600"><Wallet size={11} /> No wallet linked</span>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <TierBadge tier={highestTier} size="lg" />
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Portfolio Value', value: `$${totalValue.toLocaleString()}`, color: 'text-green-400',  icon: Wallet    },
          { label: 'NFTs Owned',      value: tokenCount,                        color: 'text-white',      icon: Award     },
          { label: 'Top Tier',        value: highestTier,                       color: 'text-amber-400',  icon: TrendingUp},
          { label: 'Network',         value: 'Sepolia',                         color: 'text-blue-400',   icon: Zap       },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="section-label">{label}</p>
              <Icon size={14} className={color} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {user?.tokenIds?.length > 0 && (
        <div className="card p-5 mb-8">
          <p className="section-label mb-3">Owned Token IDs</p>
          <div className="flex flex-wrap gap-2">
            {user.tokenIds.map(id => (
              <Link key={id} to={`/nft/${id}`}
                className="px-3 py-1 text-xs font-mono border border-white/10 bg-white/5 text-gray-300 hover:border-green-400/50 hover:text-white transition">
                #{id}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-3xl text-white">Your Collection</h2>
        <span className="text-xs text-gray-400">{tokenCount} moments</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tokens.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500 mb-2 text-sm">No moments in your collection yet.</p>
          <p className="text-gray-600 text-xs mb-6">Buy a moment to start earning yield and watching your NFTs evolve.</p>
          <Link to="/buy" className="btn-primary px-8 py-3 inline-flex items-center gap-2">
            <Zap size={15} /> Buy Your First Moment
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tokens.map(nft => <NFTCard key={nft.tokenId} nft={nft} />)}
        </div>
      )}
    </div>
  );
}
