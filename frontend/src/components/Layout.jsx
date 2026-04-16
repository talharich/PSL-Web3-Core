import { Link, useLocation, Outlet } from 'react-router-dom';
import { Zap, LayoutDashboard, ShoppingBag, Home, User, LogOut, ChevronDown, Trophy } from 'lucide-react';
import { useState } from 'react';
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
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-[70px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] group-hover:scale-110 transition"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              🏏
            </div>
            <div className="leading-tight">
              <h1 className="text-lg font-bold tracking-wide">
                DYNAMIC<span className="text-green-400">MOMENTS</span>
              </h1>
              <p className="text-xs text-gray-400">PSL × WEB3 · 2026</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon, cta }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to}
                  className={`relative flex items-center gap-1.5 px-3 py-2 text-sm transition-all duration-200
                    ${cta
                      ? 'bg-green-500 text-black font-semibold shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-105 ml-2'
                      : active
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/8'
                    }`}
                >
                  <Icon size={13} />
                  {label}
                  {active && !cta && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: status + auth */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10">
              <div className="w-2 h-2 bg-green-400 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" style={{ borderRadius: '50%' }} />
              <span className="text-xs text-gray-300">Live</span>
            </div>

            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(d => !d)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/10 text-sm text-white hover:bg-white/15 transition"
                >
                  <User size={13} className="text-green-400" />
                  <span className="max-w-[90px] truncate">{user?.displayName || user?.email}</span>
                  <ChevronDown size={11} className="text-gray-400" />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-44 py-1 z-50"
                    style={{ background: 'rgba(5,9,6,0.98)', border: '1px solid rgba(34,197,94,0.15)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
                  >
                    <Link to="/profile" onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition">
                      <User size={12} /> My Profile
                    </Link>
                    <Link to="/dashboard" onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition">
                      <LayoutDashboard size={12} /> Collection
                    </Link>
                    {user?.isAdmin && (
                      <Link to="/admin" onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-amber-400 hover:bg-amber-400/10 transition">
                        ⚡ Admin Panel
                      </Link>
                    )}
                    <div className="my-1 border-t border-white/10" />
                    <button onClick={() => { logout(); setShowDropdown(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition">
                      <LogOut size={12} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)}
                className="px-4 py-1.5 text-sm border border-white/20 text-gray-300 hover:border-green-400/50 hover:text-white transition">
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex border-t border-white/10 bg-black/30 backdrop-blur-xl">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] transition ${active ? 'text-green-400' : 'text-gray-500'}`}>
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </div>
      </header>

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
