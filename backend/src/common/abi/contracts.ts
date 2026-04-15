// Minimal ABIs — only the functions the backend needs to call.
// Full ABIs live in frontend/src/abi/ after hardhat compile.

export const NFT_ABI = [
  'function mintMoment(address to, string playerId, string uri, uint8 initialTier) returns (uint256)',
  'function mintAtTier(address to, string playerId, string uri, uint8 tier) returns (uint256)',
  'function upgradeTier(uint256 tokenId, uint8 newTier, string newUri)',
  'function tokenTier(uint256 tokenId) view returns (uint8)',
  'function tokenPlayer(uint256 tokenId) view returns (string)',   // matches PSLMomentNFT.sol mapping name
  'function getTBAAddress(uint256 tokenId) view returns (address)',
  'function tokensOfPlayer(string playerId) view returns (uint256[])',  // matches PSLMomentNFT.sol function name
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function nextTokenId() view returns (uint256)',
  'function mintedByTier(uint8 tier) view returns (uint256)',
  'function maxSupplyByTier(uint8 tier) view returns (uint256)',
  'event MomentMinted(uint256 indexed tokenId, address indexed owner, string playerId)',
  'event TierUpgraded(uint256 indexed tokenId, uint8 oldTier, uint8 newTier, string newUri)',
];

export const ORACLE_ABI = [
  'function updatePlayerStats(string playerId, uint256 runs, uint256 strikeRate, uint256 wickets, string rarityTrigger, string newTokenUri)',
  'function latestStats(string playerId) view returns (uint256 runs, uint256 strikeRate, uint256 wickets, string rarityTier, uint256 lastUpdated)',
  'function registerPlayerToken(string playerId, uint256 tokenId)',
  'event StatsUpdated(string indexed playerId, uint256 runs, uint256 wickets, string tier)',
  'event UpgradeTriggered(string indexed playerId, uint256 indexed tokenId, string newTier)',
];

export const MARKETPLACE_ABI = [
  'function listings(uint256 tokenId) view returns (address seller, uint256 price, bool active)',
  'function listNFT(uint256 tokenId, uint256 price)',
  'function cancelListing(uint256 tokenId)',
  'function buyNFT(uint256 tokenId) payable',
  'event Listed(uint256 indexed tokenId, address indexed seller, uint256 price)',
  'event Sold(uint256 indexed tokenId, address indexed buyer, uint256 price, uint256 royalty, uint256 fee)',
  'event ListingCancelled(uint256 indexed tokenId)',
];

export const YIELD_ABI = [
  'function claimableByToken(uint256 tokenId) view returns (uint256)',
  'function claimYield(uint256 tokenId)',
  'function distributeYield()',
  'function totalAccumulated() view returns (uint256)',
];

// Tier enum mapping — mirrors the Solidity enum order
// Rarity scheme from Deadshot.io
export enum Tier {
  COMMON    = 0,
  UNCOMMON  = 1,
  RARE      = 2,
  EPIC      = 3,
  LEGENDARY = 4,
}

export const TIER_NAMES: Record<number, string> = {
  0: 'COMMON',
  1: 'UNCOMMON',
  2: 'RARE',
  3: 'EPIC',
  4: 'LEGENDARY',
};

export const TIER_FROM_STRING: Record<string, number> = {
  COMMON:    0,
  UNCOMMON:  1,
  RARE:      2,
  EPIC:      3,
  LEGENDARY: 4,
};

// Supply caps enforced on-chain, mirrored here for validation
export const MAX_SUPPLY: Record<string, number> = {
  COMMON:    10000,
  UNCOMMON:  1000,
  RARE:      100,
  EPIC:      10,
  LEGENDARY: 3,   
};