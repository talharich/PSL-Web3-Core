import { Link, useLocation, Outlet } from 'react-router-dom';
import { Zap, LayoutDashboard, ShoppingBag, Home, User, LogOut, ChevronDown, Trophy } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const NAV = [
  { to: '/',            label: 'Home',        icon: Home },
  { to: '/dashboard',   label: 'Collection',  icon: LayoutDashboard },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/buy',         label: 'Buy NFT',     icon: Zap, cta: true },
];

export default function Layout() {
  const { pathname } = useLocation();
  const { user, logout, isLoggedIn } = useAuth();
  const [showAuth,     setShowAuth]     = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#05060a] text-white overflow-hidden">
      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-200px] left-[-150px] w-[600px] h-[600px] rounded-full blur-[120px] opacity-25 bg-green-500" />
        <div className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] rounded-full blur-[120px] opacity-15 bg-emerald-400" />
      </div>

      {/* NAVBAR */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-black/30 border-b border-white/10">

        <div className="max-w-7xl mx-auto px-6 h-[70px] flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)] group-hover:scale-110 transition">
              🏏
            </div>

            <div className="leading-tight">
              <h1 className="text-lg font-bold tracking-wide">
                DYNAMIC<span className="text-green-400">MOMENTS</span>
              </h1>
              <p className="text-xs text-gray-400">
                PSL × WEB3 · 2026
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {NAV.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`
                    relative flex items-center gap-2 px-4 py-2 text-sm
                    transition-all duration-300
                    ${item.cta
                      ? 'bg-green-500 text-black font-semibold rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-105'
                      : active
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white'
                    }
                  `}
                >
                  <Icon size={15} />
                  {item.label}

                  {active && !item.cta && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-400 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Status Pill */}
          {/* <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"> */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
            <span className="text-xs text-gray-300">Live System Active</span>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex border-t border-white/10 bg-black/30 backdrop-blur-xl">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`
                  flex-1 flex flex-col items-center gap-1 py-2 text-[11px]
                  transition
                  ${active ? 'text-green-400' : 'text-gray-500'}
                `}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </motion.header>

      {/* MAIN */}
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">Dynamic Moments · PSL × Web3 · 2026</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Powered by <span className="text-green-400">WireFluid</span></span>
            <span>ERC-6551</span>
            <span>Sepolia Testnet</span>
          </div>
        </div>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
