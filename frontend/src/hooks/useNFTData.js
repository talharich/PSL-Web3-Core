/**
 * useNFTData — serves data directly from mock data, no backend calls.
 */
import { useMemo } from 'react';
import { MOCK_NFTS, MARKETPLACE_LISTINGS, TIER_CONFIG } from '../data/mockData';

// ── Normalise token shape (kept so other components that import this still work) ─
export function normaliseToken(t) {
  return {
    tokenId:         String(t.tokenId ?? t.id ?? t.token_id ?? '?'),
    playerId:        t.playerId        ?? t.player_id        ?? '',
    playerName:      t.playerName      ?? t.player_name      ?? t.name ?? '',
    team:            t.team            ?? '',
    moment:          t.moment          ?? t.description      ?? '',
    stat:            t.stat            ?? '',
    matchContext:    t.matchContext    ?? t.match_context     ?? '',
    score:           Number(t.score)   || 0,
    tier:            t.tier            ?? 'COMMON',
    mintRarity:      Number(t.mintRarity ?? t.mint_rarity)   || 0,
    estimatedValue:  Number(t.estimatedValue ?? t.estimated_value ?? t.price) || 0,
    narrative:       t.narrative       ?? '',
    upgradeHistory:  t.upgradeHistory  ?? t.upgrade_history  ?? [],
    scoreComponents: t.scoreComponents ?? t.score_components ?? { form: 0, milestone: 0, popularity: 0, rarity: 0 },
    listed:          Boolean(t.listed),
    listPrice:       Number(t.listPrice ?? t.list_price)     || null,
    image:           t.image           ?? t.imageUrl         ?? null,
    video:           t.video           ?? t.videoUrl         ?? null,
    tierIndex:       ['COMMON', 'RARE', 'EPIC', 'LEGEND', 'ICON'].indexOf(t.tier ?? 'COMMON'),
  };
}

const ALL_NFTS       = MOCK_NFTS.map(normaliseToken);
const ALL_LISTINGS   = MARKETPLACE_LISTINGS.map(normaliseToken);

export function useNFTList() {
  return ALL_NFTS;
}

export function useNFT(tokenId) {
  return ALL_NFTS.find(n => n.tokenId === String(tokenId)) ?? null;
}

export function useTokenDetail(tokenId) {
  const data = ALL_NFTS.find(n => n.tokenId === String(tokenId)) ?? null;
  return { data, loading: false, error: null };
}

export function useMarketListings() {
  return { listings: ALL_LISTINGS, loading: false, error: null, reload: () => {} };
}

export function useMarketStats() {
  return { stats: null, loading: false };
}

export function useOracleEvents() {
  return { events: [], loading: false };
}

export function useBuyableMoments() {
  return { moments: ALL_LISTINGS, loading: false, error: null };
}