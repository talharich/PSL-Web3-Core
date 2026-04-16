import { useState } from 'react';
import { X, Zap, Lock } from 'lucide-react';
import { payment as paymentApi } from '../services/api';
import { TIER_CONFIG } from '../data/mockData';

export default function BuyModal({ moment, onClose, onSuccess }) {
  const [step, setStep] = useState('confirm'); // confirm | processing | success
  const [error, setError] = useState('');

  const tier = TIER_CONFIG[moment.tier ?? 'COMMON'] ?? TIER_CONFIG.COMMON;
  // FIX: backend returns priceUsd, not price
  const price = moment.priceUsd ?? moment.price ?? moment.listPrice ?? moment.estimatedValue ?? 0;

  const handleDemoBuy = async () => {
    // tokenId is a minted blockchain token — never a valid eventId
    const eventId = moment.eventId;
    if (!eventId) {
      setError('Could not determine moment ID — please close and reselect.');
      return;
    }

    setStep('processing');
    setError('');
    try {
      // api.js demoConfirm(eventId) wraps it as { eventId } internally
      await paymentApi.demoConfirm(eventId);
      setStep('success');
      setTimeout(() => {
        onSuccess?.(moment);
        onClose();
      }, 3000);
    } catch (e) {
      setError(e.message || 'Purchase failed. Please try again.');
      setStep('confirm');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md animate-fade-in"
        style={{
          background: 'rgba(5,9,6,0.98)',
          border: `1px solid ${tier.color}40`,
          boxShadow: `0 0 80px ${tier.color}20`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <div>
            <p className="section-label mb-1">Purchase Moment</p>
            <div style={{ color: tier.color }} className="font-display text-2xl tracking-wide">
              {moment.tier ?? 'COMMON'} TIER
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5">
          {step === 'confirm' && (
            <>
              {/* Moment info */}
              <div className="text-center mb-6 p-5" style={{ background: `${tier.color}08`, borderBottom: `1px solid ${tier.color}20` }}>
                <p className="text-white font-semibold text-lg">{moment.playerName ?? moment.player_name}</p>
                <p className="text-sm mt-1" style={{ color: tier.color }}>{(moment.stat ?? moment.moment ?? '').replace(/_/g, ' ')}</p>
                <p className="text-gray-500 text-xs mt-1">{moment.matchContext}</p>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Moment Price</span>
                  <span className="text-white">${price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Player Royalty (10%)</span>
                  <span className="text-blue-400">${Math.round(price * 0.10).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Platform (5%)</span>
                  <span className="text-gray-300">${Math.round(price * 0.05).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                  <span className="text-white font-semibold">Total</span>
                  <span className="font-bold text-lg" style={{ color: tier.color }}>${price.toLocaleString()}</span>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-3 py-2 mb-4">{error}</p>}

              <button onClick={handleDemoBuy}
                className="w-full py-3.5 font-semibold text-sm flex items-center justify-center gap-2 transition hover:scale-[1.02]"
                style={{ background: `${tier.color}`, color: '#000' }}
              >
                <Zap size={15} /> Mint · ${price.toLocaleString()}
              </button>
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
                <Lock size={11} className="text-green-400" />
                Gasless via WireFluid — No ETH required
              </div>
            </>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                style={{ borderColor: `${tier.color}40`, borderTopColor: tier.color }} />
              <p className="text-white font-semibold mb-4">Minting your Moment...</p>
              <div className="space-y-2 text-left text-sm">
                {['✓ Payment confirmed', '⟳ Calling oracle...', '  Pinning to IPFS', '  Updating on-chain'].map((s, i) => (
                  <div key={i} className={`font-mono text-xs ${i < 2 ? (i === 0 ? 'text-green-400' : 'text-yellow-400') : 'text-gray-600'}`}>{s}</div>
                ))}
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🏆</div>
              <p className="font-display text-4xl text-white mb-2">MINTED!</p>
              <p className="text-sm" style={{ color: tier.color }}>
                <strong>{moment.tier}</strong> — {moment.playerName ?? moment.player_name}
              </p>
              <p className="text-gray-500 text-xs mt-3">Your NFT is live on Sepolia. Royalties flow automatically as it trades.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}