/**
 * useNFTData — live NFT data hooks backed by the real API
 * Falls back to mock data when the backend is unreachable (demo mode).
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { nft as nftApi, marketplace as marketApi, oracle as oracleApi, payment as paymentApi } from '../services/api';
import { MOCK_NFTS, TIER_CONFIG } from '../data/mockData';

// ── Normalise backend token shape to match the local NFT shape ───────────────
export function normaliseToken(t) {
  return {
    tokenId:        String(t.tokenId ?? t.id ?? t.token_id ?? '?'),
    playerId:       t.playerId        ?? t.player_id        ?? '',
    playerName:     t.playerName      ?? t.player_name      ?? t.name ?? '',
    team:           t.team            ?? '',
    moment:         t.moment          ?? t.description      ?? '',
    stat:           t.stat            ?? '',
    matchContext:   t.matchContext    ?? t.match_context     ?? '',
    score:          Number(t.score)   || 0,
    tier:           t.tier            ?? 'COMMON',
    mintRarity:     Number(t.mintRarity ?? t.mint_rarity) || 0,
    estimatedValue: Number(t.estimatedValue ?? t.estimated_value ?? t.price) || 0,
    narrative:      t.narrative       ?? '',
    upgradeHistory: t.upgradeHistory  ?? t.upgrade_history  ?? [],
    scoreComponents:t.scoreComponents ?? t.score_components ?? { form:0, milestone:0, popularity:0, rarity:0 },
    listed:         Boolean(t.listed),
    listPrice:      Number(t.listPrice ?? t.list_price)     || null,
    image:          t.image           ?? t.imageUrl         ?? null,
    video:          t.video           ?? t.videoUrl         ?? null,
    tierIndex:      ['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY','LEGEND','ICON'].indexOf(t.tier ?? 'COMMON'),
  };
}

// ── Wraps a promise with a hard timeout so fetch never hangs forever ─────────
function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// ── Mock fallback — always returns something visible ─────────────────────────
function getMockListings() {
  const listed = MOCK_NFTS.filter(n => n.listed);
  // If no mock NFTs are marked listed, show all so the UI is never blank
  return listed.length > 0 ? listed : MOCK_NFTS.map(n => ({ ...n, listed: true }));
}

// ── Global state shared between hook instances ───────────────────────────────
let cachedNFTs   = null;
let fetchPromise = null;
const subscribers = new Set();

function notify(nfts) {
  cachedNFTs = nfts;
  subscribers.forEach(fn => fn([...nfts]));
}

async function fetchNFTs() {
  // Try marketplace listings
  try {
    const listingsData = await withTimeout(marketApi.listings());
    const listings = Array.isArray(listingsData)
      ? listingsData
      : (listingsData.listings ?? []);

    if (listings.length > 0) {
      return listings.map(normaliseToken);
    }
  } catch (_) { /* fall through */ }

  // Fallback: oracle buyable moments
  try {
    const buyable = await withTimeout(oracleApi.buyable());
    if (buyable?.length) {
      return buyable.map((e, i) => normaliseToken({
        tokenId: String(i + 1).padStart(3, '0'),
        ...e,
        score: (TIER_CONFIG[e.tier]?.min ?? 0) + 50,
        estimatedValue: e.price,
        listed: true,
        listPrice: e.price,
      }));
    }
  } catch (_) { /* fall through */ }

  // Final fallback: static mock data
  return getMockListings().map(normaliseToken);
}

export function useNFTList() {
  const [nfts, setNFTs] = useState(cachedNFTs ?? getMockListings());

  const load = useCallback(async () => {
    if (fetchPromise) return fetchPromise;
    fetchPromise = fetchNFTs().finally(() => { fetchPromise = null; });
    try {
      const result = await fetchPromise;
      notify(result);
    } catch (_) {
      // fetchPromise already cleared by .finally; keep existing data
    }
  }, []);

  useEffect(() => {
    const handler = (updated) => setNFTs(updated);
    subscribers.add(handler);
    load();
    const interval = setInterval(load, 10000);
    return () => {
      subscribers.delete(handler);
      clearInterval(interval);
    };
  }, [load]);

  return nfts;
}

export function useNFT(tokenId) {
  const nfts = useNFTList();
  return nfts.find(n => n.tokenId === String(tokenId)) ?? null;
}

export function useTokenDetail(tokenId) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!tokenId) return;
    setLoading(true);
    withTimeout(nftApi.token(tokenId))
      .then(t => setData(normaliseToken(t)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [tokenId]);

  return { data, loading, error };
}

export function useMarketListings(player) {
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const isFirstLoad = useRef(true);
  const playerRef   = useRef(player);
  playerRef.current = player;

  const load = useCallback(async () => {
    // Only show the spinner on the very first load, not on background poll refreshes
    if (isFirstLoad.current) setLoading(true);

    try {
      const data = await withTimeout(marketApi.listings(playerRef.current));
      const arr  = Array.isArray(data) ? data : (data?.listings ?? []);
      setListings(arr.map(normaliseToken));
      setError(null);
    } catch (err) {
      // On first load fall back to mock data so the UI is never a blank spinner
      if (isFirstLoad.current) {
        setListings(getMockListings().map(normaliseToken));
      }
      // Keep existing listings on poll errors — don't wipe live data
      setError(err.message ?? 'Failed to load listings');
    } finally {
      setLoading(false);
      isFirstLoad.current = false;
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000); // 3s was too aggressive
    return () => clearInterval(interval);
  }, [load]);

  return { listings, loading, error, reload: load };
}

export function useMarketStats() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    withTimeout(marketApi.stats())
      .then(setStats)
      .catch(() => setStats({ totalVolume: 0, royaltiesPaid: 0, activeListings: 0 }))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}

export function useOracleEvents() {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    withTimeout(oracleApi.events())
      .then(data => setEvents(Array.isArray(data) ? data : (data.events ?? [])))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return { events, loading };
}

export function useBuyableMoments() {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    withTimeout(paymentApi.moments())
      .then(data => {
        const arr = Array.isArray(data) ? data : (data.moments ?? []);
        console.log('[useBuyableMoments] API returned:', arr);
        
        // If API returns real data, use it; otherwise fall back to mock NFTs
        const finalMoments = arr.length > 0 ? arr : MOCK_NFTS.map(n => ({
          ...n,
          eventId: n.tokenId,
          // FIX: use priceUsd consistently so Buy.jsx and BuyModal.jsx
          // both resolve the price correctly without falling through to $0
          priceUsd: n.listPrice ?? n.estimatedValue ?? 0,
        }));
        
        console.log('[useBuyableMoments] Final moments:', finalMoments);
        setMoments(finalMoments);
      })
      .catch(async () => {
        console.log('[useBuyableMoments] API failed, trying oracle...');
        try {
          const b = await withTimeout(oracleApi.buyable());
          if (b?.length) { 
            console.log('[useBuyableMoments] Oracle returned:', b);
            setMoments(b); 
            return; 
          }
          throw new Error('empty');
        } catch {
          console.log('[useBuyableMoments] All APIs failed, using mock data');
          // Final fallback: use real mock NFTs so Buy page is never blank
          const fallbackMoments = MOCK_NFTS.map(n => ({
            ...n,
            eventId: n.tokenId,
            // FIX: same fix as above — priceUsd not price
            priceUsd: n.listPrice ?? n.estimatedValue ?? 0,
          }));
          console.log('[useBuyableMoments] Final fallback moments:', fallbackMoments);
          setMoments(fallbackMoments);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { moments, loading, error };
}