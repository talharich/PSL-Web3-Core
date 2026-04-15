/**
 * Dynamic Fantasy Moments — Backend API Client
 * Maps to NestJS controllers:
 *   auth_controller.ts      → /api/auth
 *   nft_controller.ts       → /api/nft
 *   marketplace_controller  → /api/marketplace
 *   oracle_controller       → /api/oracle
 *   payment_controller      → /api/payment
 *   metadata_controller     → /api/metadata
 */

const BASE = import.meta.env.VITE_API_URL;
// ─── Token store ─────────────────────────────────────────────────────────────
let _token = localStorage.getItem('dfm_token') || null;

const getAuthHeader = () => {
  const token = localStorage.getItem('token'); // or wherever you store it
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export function setToken(t) {
  _token = t;
  if (t) localStorage.setItem('dfm_token', t);
  else localStorage.removeItem('dfm_token');
}

export function getToken() { return _token; }
export function isLoggedIn() { return Boolean(_token); }

// ─── Core fetch ──────────────────────────────────────────────────────────────
async function req(method, path, body, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && _token) headers['Authorization'] = `Bearer ${_token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

const get = (path, auth = false) => req('GET', path, undefined, auth);
const post = (path, body, auth = false) => req('POST', path, body, auth);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const auth = {
  // ── STEP 1: Request OTP (Signup start)
  signup: (email, password, displayName) =>
    post('/auth/signup/request-otp', { email, password, displayName }),

  // ── STEP 2: Verify OTP (Create account)
  verifyOtp: (email, otp, password, displayName) =>
    post('/auth/signup/verify-otp', { email, otp, password, displayName }),

  // ── Resend OTP
  resendOtp: (email) =>
    post('/auth/signup/resend-otp', { email }),

  // ── Login
  login: (email, password) =>
    post('/auth/login', { email, password }),

  // ── Get logged-in user
  me: () => get('/auth/me', true),
};

// ─── NFT ──────────────────────────────────────────────────────────────────────
export const nft = {
  /** GET /nft/supply → tier caps + remaining */
  supply: () => get('/nft/supply'),

  /** GET /nft/total → { total } */
  total: () => get('/nft/total'),

  /** GET /nft/leaderboard?limit=N */
  leaderboard: (limit = 10) => get(`/nft/leaderboard?limit=${limit}`),

  /** GET /nft/:tokenId */
  token: (tokenId) => get(`/nft/${tokenId}`),

  /** GET /nft/player/:playerId/tokens */
  playerTokens: (playerId) => get(`/nft/player/${playerId}/tokens`),

  /** GET /nft/player/:playerId/stats */
  playerStats: (playerId) => get(`/nft/player/${playerId}/stats`),

  /** GET /nft/player/:playerId/portfolio */
  portfolio: (playerId) => get(`/nft/player/${playerId}/portfolio`),
};

// ─── MARKETPLACE ──────────────────────────────────────────────────────────────
export const marketplace = {
  /** GET /marketplace/listings?player= */
  listings: (player) =>
    get(player ? `/marketplace/listings?player=${encodeURIComponent(player)}` : '/marketplace/listings'),

  /** GET /marketplace/listings/:tokenId */
  listing: (tokenId) => get(`/marketplace/listings/${tokenId}`),

  /** GET /marketplace/history */
  allHistory: () => get('/marketplace/history'),

  /** GET /marketplace/history/:tokenId */
  tokenHistory: (tokenId) => get(`/marketplace/history/${tokenId}`),

  /** GET /marketplace/stats */
  stats: () => get('/marketplace/stats'),

  /** GET /marketplace/yield/:tokenId */
  yield: (tokenId) => get(`/marketplace/yield/${tokenId}`),

  /**
   * GET /marketplace/yield/accumulated
   * NOTE: In NestJS, static routes take precedence over parameterised ones
   * so /yield/accumulated should resolve correctly even though /yield/:tokenId
   * is declared first in the controller. If the backend returns a 400 (ParseIntPipe
   * rejecting "accumulated"), this call will throw and callers must handle it.
   */
  totalYield: () => get('/marketplace/yield/accumulated'),
};

// ─── ORACLE ──────────────────────────────────────────────────────────────────
export const oracle = {
  /** POST /oracle/trigger/:eventId  (admin) */
  trigger: (eventId) => post(`/oracle/trigger/${eventId}`, {}, true),

  /** POST /oracle/mint-at-tier  (admin) */
  mintAtTier: (toAddress, playerId, tier, eventId) =>
    post('/oracle/mint-at-tier', { toAddress, playerId, tier, eventId }, true),

  /** POST /oracle/register-token  (admin) */
  registerToken: (playerId, tokenId) =>
    post('/oracle/register-token', { playerId, tokenId }, true),

  /** POST /oracle/score/calculate */
  calculateScore: (data) => post('/oracle/score/calculate', data),

  /** GET /oracle/events/list */
  events: () => get('/oracle/events/list'),

  /** GET /oracle/milestones */
  milestones: () => get('/oracle/milestones'),

  /** GET /oracle/moments/buyable */
  buyable: () => get('/oracle/moments/buyable'),
};

// ─── PAYMENT ─────────────────────────────────────────────────────────────────

export const payment = {
  demoConfirm: (eventId) =>
    fetch('/api/payment/demo-confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),   // ← this must be here
      },
      body: JSON.stringify({ eventId }),
    }).then(res => {
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    }),
};
// ─── METADATA ────────────────────────────────────────────────────────────────
export const metadata = {
  /** POST /metadata/preview  (admin) */
  preview: (event) => post('/metadata/preview', event, true),

  /** POST /metadata/pin  (admin) */
  pin: (event) => post('/metadata/pin', event, true),

  /** GET /metadata/matches/live */
  liveMatches: () => get('/metadata/matches/live'),

  /** GET /metadata/player/:cricapiId/stats */
  playerStats: (cricapiId) => get(`/metadata/player/${cricapiId}/stats`),

  /** GET /metadata/match/:matchId/scorecard */
  scorecard: (matchId) => get(`/metadata/match/${matchId}/scorecard`),
};

export default { auth, nft, marketplace, oracle, payment, metadata };