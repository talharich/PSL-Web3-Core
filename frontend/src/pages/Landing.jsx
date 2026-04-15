import { Link } from 'react-router-dom';
import { Zap, TrendingUp, Shield, ArrowRight, ChevronRight, Coins } from 'lucide-react';
import NFTCard from '../components/NFTCard';
import { MOCK_NFTS } from '../data/mockData';

const FEATURES = [
  {
    icon: Zap,
    title: 'Zero Gas Fees',
    desc: 'Buy with a credit card. No MetaMask. No ETH. WireFluid handles everything under the hood.',
    color: 'text-psl-gold',
    glow: 'rgba(201,168,76,0.25)',
  },
  {
    icon: TrendingUp,
    title: 'NFTs That Evolve',
    desc: 'Every Babar century, every Shaheen five-for upgrades your NFT automatically. No clicks needed.',
    color: 'text-blue-400',
    glow: 'rgba(59,130,246,0.2)',
  },
  {
    icon: Shield,
    title: 'Earn While You Hold',
    desc: 'Your NFT owns its own ERC-6551 wallet. Platform fees flow in automatically.',
    color: 'text-green-400',
    glow: 'rgba(74,222,128,0.2)',
  },
];

const ROYALTY_SPLIT = [
  { pct: '85%', label: 'Seller',         color: 'text-psl-gold',  glow: 'rgba(201,168,76,0.4)' },
  { pct: '10%', label: 'Player Royalty', color: 'text-blue-400',  glow: 'rgba(59,130,246,0.4)' },
  { pct: '5%',  label: 'Platform',       color: 'text-green-400', glow: 'rgba(74,222,128,0.4)' },
];

export default function Landing() {
  return (
    // CLEAN: Just animate-fade-in, no extra divs with overlays
    <div className="animate-fade-in">

      {/* ──────────── HERO ──────────── */}
      {/* 🔴 REMOVED: z-10 (not needed) */}
      <section className="relative overflow-hidden min-h-[79vh] flex items-center">

        {/* Grid background */}
        <div className="hero-grid absolute inset-0 pointer-events-none" />

        {/* Mesh glow */}
        <div className="hero-bg-mesh absolute inset-0 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="max-w-4xl mx-auto text-center">

            {/* Live pill */}
            <div className="inline-flex items-center gap-2.5 pill pill-live mb-10 animate-slide-up">
              <div className="live-dot" />
              <span className="text-sm">PSL 2026 · Live Season · Moments Upgrading Now</span>
            </div>

            {/* Headline */}
            <h1
              className="font-display text-white leading-none mb-4 hero-text-glow animate-fade-in"
              style={{ fontSize: 'clamp(2.5rem, 10vw, 7rem)', letterSpacing: '0.02em', lineHeight: '0.95' }}
            >
              OWN THE<br />
              <span className="text-gradient-gold">GREATEST</span><br />
              MOMENTS
            </h1>

            <p className="text-gray-400 text-lg md:text-xl font-body max-w-2xl mx-auto mb-6 leading-relaxed animate-fade-in delay-200">
              Dynamic NFTs that evolve with real PSL performance. Every century, every five-for,
              every last-ball six — minted on-chain, upgraded automatically, owned forever.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4 animate-fade-in delay-300">
              <Link to="/buy" className="btn-primary text-base py-4 px-8">
                <Zap size={17} />
                Buy with Credit Card
              </Link>
              <Link to="/dashboard" className="btn-ghost text-base py-4 px-8">
                View Collection
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Trust line */}
            <p className="text-psl-muted text-sm font-body animate-fade-in delay-400">
              No wallet needed · No ETH required · No gas fees · Powered by WireFluid
            </p>
          </div>
        </div>
      </section>

      {/* ──────────── FEATURES ──────────── */}
      {/* 🔴 REMOVED: relative and z-10 */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          {/* FONT SIZE: text-[16px] for better visibility */}
          <p className="section-label text-[25px] mb-2">Why Dynamic Moments</p>
          <h2 className="font-display text-7xl text-white">Built Different</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, color, glow }) => (
            <div
              key={title}
              className="card p-7 group hover:border-psl-border-bright transition-all duration-300 hover:-translate-y-1"
              style={{ '--hover-glow': glow }}
            >
              <div
                className="w-12 h-12 flex items-center justify-center mb-5 transition-all duration-300"
                style={{
                  background: `${glow.replace('0.25', '0.1').replace('0.2', '0.1')}`,
                  border: `1px solid ${glow.replace('0.25','0.3').replace('0.2','0.25')}`,
                  boxShadow: `0 0 12px ${glow.replace('0.25', '0.12').replace('0.2', '0.1')}`,
                }}
              >
                <Icon className={color} size={22} />
              </div>
              <h3 className="font-display text-2xl text-white mb-2 tracking-wide">{title}</h3>
              <p className="text-gray-400 font-body text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────── FEATURED NFTs ──────────── */}
      {/* 🔴 REMOVED: relative and z-10 */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="section-label text-[15px]">Live PSL 2026</p>
            <h2 className="font-display text-[55px] text-white">Featured Moments</h2>
          </div>
          <Link
            to="/marketplace"
            className="flex items-center gap-1 text-psl-gold text-sm font-body hover:text-psl-gold-light transition-colors"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MOCK_NFTS.map((nft, i) => (
            <div key={nft.tokenId} className={`animate-slide-up delay-${(i + 1) * 100}`}>
              <NFTCard nft={nft} showBuy />
            </div>
          ))}
        </div>
      </section>

      {/* ──────────── ROYALTY SPLIT ──────────── */}
      <section
        className="relative overflow-hidden py-20"
        style={{
          background: 'var(--psl-dark)',
          borderTop: '1px solid var(--psl-border)',
          borderBottom: '1px solid var(--psl-border)',
        }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="section-label text-sm mb-3">Smart Contract Enforced</p>
          <h2 className="font-display text-5xl text-white mb-3">
            Every Trade, <span className="text-gradient-gold">Auto Split</span>
          </h2>
          <p className="text-psl-muted font-body mb-14 text-base">
            No trust needed. No intermediaries. Just code.
          </p>

          <div className="grid grid-cols-3 gap-8">
            {ROYALTY_SPLIT.map(({ pct, label, color, glow }) => (
              <div key={label} className="card p-6 text-center">
                <p
                  className={`font-display text-5xl md:text-6xl ${color} mb-2`}
                  style={{ textShadow: `0 0 18px ${glow.replace('0.4', '0.2')}` }}
                >
                  {pct}
                </p>
                <div className="divider my-3" />
                <p className="text-gray-400 text-base font-body">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}