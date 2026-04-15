import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './contexts/AuthContext';

const Landing = lazy(() => import('./pages/Landing'));
const Buy = lazy(() => import('./pages/Buy'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NFTDetail = lazy(() => import('./pages/NFTDetail'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const PlayerStats = lazy(() => import('./pages/PlayerStats'));
const Leaderboard = lazy(() => import('./pages/LeaderBoard'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const MomentDetail = lazy(() => import('./pages/Momentdetailpage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05060a]">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-green-400 text-sm tracking-widest">Loading Experience...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/buy" element={<Buy />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/nft/:tokenId" element={<NFTDetail />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/player/:playerId" element={<PlayerStats />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/moment/:tokenId" element={<MomentDetail />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}