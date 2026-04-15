export const TIER_CONFIG = {
  COMMON: { label: 'Common', color: '#6b7280', bg: 'bg-gray-500',     border: 'border-gray-500',  glow: 'tier-glow-common', min: 0   },
  RARE:   { label: 'Rare',   color: '#3b82f6', bg: 'bg-blue-500',     border: 'border-blue-500',  glow: 'tier-glow-rare',   min: 200 },
  EPIC:   { label: 'Epic',   color: '#a855f7', bg: 'bg-purple-500',   border: 'border-purple-500',glow: 'tier-glow-epic',   min: 450 },
  LEGEND: { label: 'Legend', color: '#f59e0b', bg: 'bg-amber-500',    border: 'border-amber-500', glow: 'tier-glow-legend', min: 700 },
  ICON:   { label: 'Icon',   color: '#ef4444', bg: 'bg-red-500',      border: 'border-red-500',   glow: 'tier-glow-icon',   min: 900 },
};

export const PLAYERS = [
  {
    id: 'babar-azam',
    name: 'Babar Azam',
    team: 'Karachi Kings',
    role: 'Batsman',
    avatar: '🏏',
    milestones: ['century','player_of_match','national_squad','psl_title'],
    recentForm: [88, 72, 95, 60, 85],
    tradeVolume: 920,
  },
  {
    id: 'shaheen-afridi',
    name: 'Shaheen Afridi',
    team: 'Lahore Qalandars',
    role: 'Bowler',
    avatar: '🎳',
    milestones: ['five_wicket_haul','hat_trick','national_squad','player_of_match'],
    recentForm: [90, 78, 88, 82, 76],
    tradeVolume: 850,
  },
  {
    id: 'mohammad-rizwan',
    name: 'Mohammad Rizwan',
    team: 'Multan Sultans',
    role: 'Wicket-keeper',
    avatar: '🧤',
    milestones: ['half_century','player_of_match','national_squad'],
    recentForm: [70, 65, 80, 60, 75],
    tradeVolume: 680,
  },
  {
    id: 'fakhar-zaman',
    name: 'Fakhar Zaman',
    team: 'Lahore Qalandars',
    role: 'Batsman',
    avatar: '💥',
    milestones: ['half_century','player_of_match'],
    recentForm: [55, 78, 45, 90, 62],
    tradeVolume: 540,
  },
];

const MILESTONE_POINTS = {
  century: 80, half_century: 30, five_wicket_haul: 90,
  hat_trick: 100, player_of_match: 40, psl_title: 150, national_squad: 50,
};

function calcScore(player, tradeVolumeMax = 1000, mintRarity = 75) {
  const last5     = player.recentForm.slice(-5);
  const avgForm   = last5.reduce((a, b) => a + b, 0) / last5.length;
  const formScore = (avgForm / 100) * 400;
  const milestoneScore = Math.min(
    player.milestones.reduce((s, m) => s + (MILESTONE_POINTS[m] || 0), 0), 250
  );
  const popScore    = (player.tradeVolume / tradeVolumeMax) * 200;
  const rarityScore = (mintRarity / 100) * 150;
  return Math.min(Math.round(formScore + milestoneScore + popScore + rarityScore), 1000);
}

function getTier(score) {
  if (score >= 900) return 'ICON';
  if (score >= 700) return 'LEGEND';
  if (score >= 450) return 'EPIC';
  if (score >= 200) return 'RARE';
  return 'COMMON';
}

export const MOCK_NFTS = [
  {
    tokenId: '001',
    playerId: 'babar-azam',
    playerName: 'Babar Azam',
    team: 'Karachi Kings',
    moment: 'PSL Final Century',
    stat: '119 runs off 67 balls',
    matchContext: 'PSL 2026 Final',
    score: 847,
    tier: 'LEGEND',
    mintRarity: 82,
    estimatedValue: 4200,
    narrative: 'Under the blazing Karachi lights, Babar Azam authored a masterclass that will echo through PSL history. 119 off 67 — not just a score, but a statement.',
    upgradeHistory: [
      { date: '2026-02-10', from: 'COMMON', to: 'RARE',   score: 240 },
      { date: '2026-03-01', from: 'RARE',   to: 'EPIC',   score: 510 },
      { date: '2026-03-28', from: 'EPIC',   to: 'LEGEND', score: 847 },
    ],
    scoreComponents: { form: 340, milestone: 250, popularity: 184, rarity: 123 },
    listed: false,
  },
  {
    tokenId: '002',
    playerId: 'shaheen-afridi',
    playerName: 'Shaheen Afridi',
    team: 'Lahore Qalandars',
    moment: 'Hat-trick vs Peshawar',
    stat: '5 wickets — 4.2 overs',
    matchContext: 'PSL 2026 Qualifier',
    score: 782,
    tier: 'LEGEND',
    mintRarity: 90,
    estimatedValue: 3800,
    narrative: 'Three deliveries. Three stumps shattered. Shaheen Afridi reminded the world why he is the most feared bowler in Pakistan cricket.',
    upgradeHistory: [
      { date: '2026-02-15', from: 'COMMON', to: 'RARE',   score: 310 },
      { date: '2026-03-10', from: 'RARE',   to: 'LEGEND', score: 782 },
    ],
    scoreComponents: { form: 330, milestone: 220, popularity: 170, rarity: 135 },
    listed: true,
    listPrice: 3900,
  },
  {
    tokenId: '003',
    playerId: 'mohammad-rizwan',
    playerName: 'Mohammad Rizwan',
    team: 'Multan Sultans',
    moment: 'Crucial 80* vs Karachi',
    stat: '80 not out off 52 balls',
    matchContext: 'PSL 2026 Eliminator',
    score: 512,
    tier: 'EPIC',
    mintRarity: 70,
    estimatedValue: 1600,
    narrative: 'When the chase looked impossible, Rizwan stood calm like the eye of a storm, threading boundaries through a ring of fielders.',
    upgradeHistory: [
      { date: '2026-02-20', from: 'COMMON', to: 'RARE', score: 290 },
      { date: '2026-03-15', from: 'RARE', to: 'EPIC',   score: 512 },
    ],
    scoreComponents: { form: 300, milestone: 120, popularity: 136, rarity: 105 },
    listed: true,
    listPrice: 1650,
  },
  {
    tokenId: '004',
    playerId: 'fakhar-zaman',
    playerName: 'Fakhar Zaman',
    team: 'Lahore Qalandars',
    moment: 'Last Ball Six',
    stat: '42 off 18 — match winner',
    matchContext: 'PSL 2026 Group Stage',
    score: 318,
    tier: 'RARE',
    mintRarity: 60,
    estimatedValue: 750,
    narrative: 'When the equation was 14 off 2, Fakhar Zaman did not blink. Two sixes later, Lahore breathed again.',
    upgradeHistory: [
      { date: '2026-03-05', from: 'COMMON', to: 'RARE', score: 318 },
    ],
    scoreComponents: { form: 264, milestone: 70, popularity: 108, rarity: 90 },
    listed: false,
  },
];

export const MARKETPLACE_LISTINGS = MOCK_NFTS.filter(n => n.listed);

export const DEMO_EVENTS = [
  { id: 'EVT-DEMO', label: 'Babar Century (RARE → LEGEND)', playerId: 'babar-azam', rarityTrigger: 'LEGEND' },
  { id: 'EVT-001',  label: 'Shaheen Hat-trick (→ ICON)',    playerId: 'shaheen-afridi', rarityTrigger: 'ICON' },
  { id: 'EVT-RESET',label: 'Reset Babar to COMMON',         playerId: 'babar-azam', rarityTrigger: 'COMMON' },
];
