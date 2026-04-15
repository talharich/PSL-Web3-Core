import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Lock, CreditCard, AlertCircle } from 'lucide-react';
import TierBadge from '../components/TierBadge';
import { useBuyableMoments } from '../hooks/useNFTData';
import { payment as paymentApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import { TIER_CONFIG } from '../data/mockData';

const STEPS = ['Select Moment', 'Payment', 'Minted!'];

export default function Buy() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { moments, loading: momentsLoading } = useBuyableMoments();

  const [step,     setStep]     = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [mintedNFT, setMintedNFT] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' });

  // Auto-select first moment
  useEffect(() => {
    if (moments?.length && !selected) setSelected(moments[0]);
  }, [moments]);

  const cfg = selected ? (TIER_CONFIG[selected.tier] ?? TIER_CONFIG.COMMON) : TIER_CONFIG.COMMON;
  const price = selected?.price ?? selected?.estimatedValue ?? 0;

  const handleBuy = async () => {
    if (!isLoggedIn) { setShowAuth(true); return; }
    if (!selected?.eventId && !selected?.id) {
      setError('Invalid moment selected');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const eventId = selected.eventId ?? selected.id;
      const result = await paymentApi.demoConfirm(eventId);
      setMintedNFT(result ?? selected);
      setStep(2);
    } catch (err) {
      // If auth fails, show auth modal; otherwise show error
      if (err.message?.toLowerCase().includes('unauthorized') || err.message?.includes('401')) {
        setShowAuth(true);
      } else {
        setError(err.message || 'Payment failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────── LOADING ───────────────── */
  if (momentsLoading && !moments?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-green-400 text-sm tracking-widest">Loading moments...</p>
        </div>
      </div>
    );
  }

  /* ───────────────── SUCCESS ───────────────── */
  if (step === 2) {
    const nft = mintedNFT ?? selected;
    const nftTier = nft?.tier ?? 'COMMON';
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center animate-fade-in">
        <div
          className="w-28 h-28 mx-auto mb-6 flex items-center justify-center text-5xl bg-green-500/10 border border-green-500/30 shadow-[0_0_80px_rgba(34,197,94,0.25)] animate-pulse"
        >✓</div>

        <h1 className="text-6xl font-bold text-white mb-3 tracking-tight">MINTED</h1>
        <p className="text-gray-400 mb-1">
          <span className="text-green-400 font-semibold">
            {nft?.playerName ?? nft?.player_name ?? 'NFT'}
          </span>{' '}— {nft?.moment ?? nft?.stat ?? ''}
        </p>
        <p className="text-sm text-gray-500 mb-8">Instant mint. No wallet. No gas.</p>

        <div className="card p-5 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Token ID</span>
            <span className="text-white font-mono">#{nft?.tokenId ?? nft?.id ?? '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Tier</span>
            <TierBadge tier={nftTier} />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Gas</span>
            <span className="text-green-400">$0.00</span>
          </div>
          {nft?.txHash && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Tx Hash</span>
              <span className="text-blue-400 font-mono text-xs truncate max-w-[150px]">{nft.txHash}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 w-full py-4 bg-green-500 text-black font-semibold hover:scale-[1.02] transition"
        >
          View Collection
        </button>
      </div>
    );
  }

  /* ───────────────── MAIN ───────────────── */
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <p className="text-green-400 text-xs tracking-widest">GASLESS · INSTANT · WEB3 FREE</p>
        <h1 className="text-5xl font-bold text-white mt-2">Buy a Moment</h1>
      </div>

      {/* Steps */}
      <div className="flex items-center mb-10 gap-3">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 flex items-center justify-center text-xs transition-all ${i <= step ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-400'}`}
              style={{ borderRadius: '50%' }}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span className="text-xs text-gray-400">{s}</span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-white/10 mx-2" />}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* LEFT */}
        <div>
          {/* STEP 0 — Select Moment */}
          {step === 0 && (
            <div className="space-y-3">
              <h2 className="text-xl text-white font-semibold">Select Moment</h2>
              {moments?.length === 0 && (
                <p className="text-gray-400 text-sm py-4">No moments available right now.</p>
              )}
              {moments?.map(m => {
                const tier = m.tier ?? 'COMMON';
                const c = TIER_CONFIG[tier] ?? TIER_CONFIG.COMMON;
                const eventId = m.eventId ?? m.id;
                const active = (selected?.eventId ?? selected?.id) === eventId;
                return (
                  <div
                    key={eventId}
                    onClick={() => setSelected(m)}
                    className="p-4 cursor-pointer transition-all duration-300 border hover:scale-[1.01]"
                    style={{
                      background: active ? `${c.color}10` : 'rgba(255,255,255,0.03)',
                      borderColor: active ? `${c.color}60` : 'rgba(255,255,255,0.08)',
                      transform: active ? 'scale(1.02)' : undefined,
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{m.playerName ?? m.player_name}</p>
                        <p className="text-xs text-gray-400">{m.stat ?? m.moment}</p>
                        {m.matchContext && (
                          <p className="text-xs text-gray-500 mt-0.5">{m.matchContext}</p>
                        )}
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <TierBadge tier={tier} />
                        <span className="text-green-400 text-sm font-bold">
                          ${(m.price ?? m.estimatedValue ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => {
                  if (!isLoggedIn) { setShowAuth(true); return; }
                  setStep(1);
                }}
                disabled={!selected}
                className="mt-4 w-full py-3 bg-green-500 text-black font-semibold hover:scale-[1.02] transition disabled:opacity-50"
              >
                {isLoggedIn ? 'Continue' : 'Sign In to Continue'}
              </button>
            </div>
          )}

          {/* STEP 1 — Payment */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl text-white font-semibold">Payment</h2>
              <p className="text-xs text-gray-400">
                Demo mode: click "Mint" to instantly receive your NFT — no real card charge.
              </p>
              {['name','number','expiry','cvc'].map(k => (
                <input
                  key={k}
                  placeholder={k === 'name' ? 'Cardholder name' : k === 'number' ? '4242 4242 4242 4242' : k === 'expiry' ? 'MM/YY' : 'CVC'}
                  value={card[k]}
                  onChange={e => setCard(p => ({ ...p, [k]: e.target.value }))}
                  className="w-full p-3 bg-white/5 border border-white/10 text-white outline-none focus:border-green-400"
                />
              ))}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Lock size={12} className="text-green-400" />
                Demo mode — no real charge · WireFluid gasless
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-3 py-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setStep(0); setError(''); }} className="flex-1 py-3 bg-white/10 text-white hover:bg-white/15 transition">
                  Back
                </button>
                <button
                  onClick={handleBuy}
                  disabled={loading}
                  className="flex-1 py-3 bg-green-500 text-black font-semibold hover:scale-[1.02] transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Minting...</>
                    : <><Zap size={14} /> Mint · ${price.toLocaleString()}</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — order summary */}
        {selected && (
          <div className="card p-6 sticky top-20 h-fit">
            <div className="text-center mb-6">
              <div
                className="w-20 h-20 mx-auto mb-4 flex items-center justify-center text-3xl font-bold rounded-2xl"
                style={{
                  background: `${cfg.color}15`,
                  border: `1px solid ${cfg.color}30`,
                  boxShadow: `0 0 30px ${cfg.color}20`,
                  color: cfg.color,
                }}
              >
                {(selected.playerName ?? selected.player_name ?? '?')[0]}
              </div>
              <TierBadge tier={selected.tier ?? 'COMMON'} size="lg" />
              <h3 className="text-white font-semibold mt-2">{selected.playerName ?? selected.player_name}</h3>
              <p className="text-gray-400 text-sm">{selected.stat ?? selected.moment}</p>
              {selected.matchContext && <p className="text-gray-500 text-xs mt-1">{selected.matchContext}</p>}
            </div>

            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>Price</span>
                <span className="text-white">${price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Gas</span>
                <span className="text-green-400">$0</span>
              </div>
              <div className="flex justify-between">
                <span>Network</span>
                <span className="text-blue-400">Sepolia</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between">
              <span className="text-gray-400">Total</span>
              <span className="text-green-400 text-xl font-bold">${price.toLocaleString()}</span>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <CreditCard size={11} className="text-green-400" />
              Secure · Gasless · Instant mint
            </div>
          </div>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}