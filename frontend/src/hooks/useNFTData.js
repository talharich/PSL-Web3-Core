import { useState, useEffect, useCallback } from 'react';
import { MOCK_NFTS, TIER_CONFIG } from '../data/mockData';

// Global state to simulate on-chain data (shared across components)
let globalNFTs = [...MOCK_NFTS];
let listeners  = new Set();

export function simulateUpgrade(playerId, newTier) {
  globalNFTs = globalNFTs.map(nft => {
    if (nft.playerId !== playerId) return nft;
    const prevTier = nft.tier;
    const newScore = TIER_CONFIG[newTier].min + 50;
    return {
      ...nft,
      tier: newTier,
      score: newScore,
      upgradeHistory: [
        ...nft.upgradeHistory,
        { date: new Date().toISOString().split('T')[0], from: prevTier, to: newTier, score: newScore },
      ],
    };
  });
  listeners.forEach(fn => fn([...globalNFTs]));
}

export function useNFTList() {
  const [nfts, setNFTs] = useState([...globalNFTs]);

  useEffect(() => {
    const handler = (updated) => setNFTs(updated);
    listeners.add(handler);

    // Simulate polling every 3s
    const interval = setInterval(() => {
      setNFTs([...globalNFTs]);
    }, 3000);

    return () => {
      listeners.delete(handler);
      clearInterval(interval);
    };
  }, []);

  return nfts;
}

export function useNFT(tokenId) {
  const nfts = useNFTList();
  return nfts.find(n => n.tokenId === tokenId);
}
