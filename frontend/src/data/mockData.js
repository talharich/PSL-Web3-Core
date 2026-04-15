// ─── Pinata gateway prefix ───────────────────────────────────────────────────
const IPFS = 'https://gateway.pinata.cloud/ipfs/';

// ─── KEEP THESE — other components import them ────────────────────────────────
export const TIER_CONFIG = {
  COMMON: { label: 'Common', color: '#6b7280', bg: 'bg-gray-500', border: 'border-gray-500', glow: 'tier-glow-common', min: 0 },
  UNCOMMON: { label: 'Uncommon', color: '#22d3ee', bg: 'bg-cyan-400', border: 'border-cyan-400', glow: 'tier-glow-uncommon', min: 100 },
  RARE: { label: 'Rare', color: '#3b82f6', bg: 'bg-blue-500', border: 'border-blue-500', glow: 'tier-glow-rare', min: 200 },
  EPIC: { label: 'Epic', color: '#a855f7', bg: 'bg-purple-500', border: 'border-purple-500', glow: 'tier-glow-epic', min: 450 },
  LEGEND: { label: 'Legend', color: '#f59e0b', bg: 'bg-amber-500', border: 'border-amber-500', glow: 'tier-glow-legend', min: 700 },
  LEGENDARY: { label: 'Legendary', color: '#f59e0b', bg: 'bg-amber-500', border: 'border-amber-500', glow: 'tier-glow-legend', min: 700 },
  ICON: { label: 'Icon', color: '#ef4444', bg: 'bg-red-500', border: 'border-red-500', glow: 'tier-glow-icon', min: 900 },
};

export const PLAYERS = [];          // keep export so nothing breaks
export const DEMO_EVENTS = [];      // keep export so nothing breaks

// ─── Tier → score / value defaults ───────────────────────────────────────────
const TIER_DEFAULTS = {
  COMMON: { score: 120, estimatedValue: 80 },
  UNCOMMON: { score: 280, estimatedValue: 220 },
  RARE: { score: 420, estimatedValue: 750 },
  EPIC: { score: 560, estimatedValue: 1600 },
  LEGENDARY: { score: 800, estimatedValue: 3800 },
  ICON: { score: 950, estimatedValue: 8000 },
};

// ─── Helper: pull a trait value out of attributes[] ──────────────────────────
function attr(attributes, traitType) {
  return attributes.find(a => a.trait_type === traitType)?.value ?? '';
}

// ─── Helper: build a canonical NFT object from your JSON metadata ─────────────
function fromMeta(tokenId, meta, extra = {}) {
  const a = meta.attributes;
  const rawTier = (attr(a, 'Tier') || 'COMMON').toUpperCase();
  const tier = rawTier === 'LEGENDARY' ? 'LEGENDARY' : rawTier;
  const defaults = TIER_DEFAULTS[tier] || TIER_DEFAULTS.COMMON;

  return {
    tokenId,
    playerName: attr(a, 'Player'),
    playerId: attr(a, 'Player ID'),
    team: attr(a, 'Fixture').split(' vs ')[extra.teamIndex ?? 0] || attr(a, 'Fixture'),
    moment: meta.name,
    stat: meta.description,
    matchContext: `${attr(a, 'Tournament')} ${attr(a, 'Match')}`,
    tier,
    score: defaults.score,
    estimatedValue: defaults.estimatedValue,
    mintRarity: defaults.score / 10,
    video: IPFS + meta.animation_url,
    image: null,
    listed: true,                          // ← FIXED: was false
    listPrice: defaults.estimatedValue,    // ← FIXED: was null
    narrative: meta.description,
    scoreComponents: { form: 0, milestone: 0, popularity: 0, rarity: 0 },
    upgradeHistory: [],
    ...extra,
  };
}

// ─── YOUR 7 REAL NFTs ─────────────────────────────────────────────────────────
export const MOCK_NFTS = [

  fromMeta('PSL11-M06-001', {
    name: "Shaheen Breaks Through — Warner Dismissed — PSL 11 Match 06",
    description: "Shaheen Shah Afridi dismisses the dangerous David Warner in the El Clasico between Karachi Kings and Lahore Qalandars.",
    animation_url: "bafybeiddhxh2ohri763ei6sltwwxdnk7xtz4sqv5isfxgrll5uli5x5wfa",
    attributes: [
      { trait_type: "Tournament", value: "PSL 11" },
      { trait_type: "Match", value: "Match 06" },
      { trait_type: "Fixture", value: "Karachi Kings vs Lahore Qalandars" },
      { trait_type: "Player", value: "Shaheen Shah Afridi" },
      { trait_type: "Player ID", value: "shaheen_afridi" },
      { trait_type: "Moment Type", value: "Wicket" },
      { trait_type: "Batter", value: "David Warner" },
      { trait_type: "Tier", value: "COMMON" },
    ],
  }, { teamIndex: 1 }),

  fromMeta('PSL11-M06-002', {
    name: "Shaheen's 4th Wicket — Epic Comeback Ignited — PSL 11 Match 06",
    description: "Shaheen Shah Afridi picks up his fourth wicket, setting the stage for a stunning Lahore Qalandars comeback.",
    animation_url: "bafybeihtkxkpxk4rx6gjqipgz2da7cnje4ttaufvyihq2ghezrub5hpgbu",
    attributes: [
      { trait_type: "Tournament", value: "PSL 11" },
      { trait_type: "Match", value: "Match 06" },
      { trait_type: "Fixture", value: "Karachi Kings vs Lahore Qalandars" },
      { trait_type: "Player", value: "Shaheen Shah Afridi" },
      { trait_type: "Player ID", value: "shaheen_afridi" },
      { trait_type: "Moment Type", value: "Wicket" },
      { trait_type: "Wickets", value: 4 },
      { trait_type: "Tier", value: "COMMON" },
    ],
  }, { teamIndex: 1 }),

  fromMeta('PSL11-M06-003', {
    name: "Mir Hamza's Bullet Catch — PSL 11 Match 06",
    description: "Mir Hamza pulls off a spectacular catch as a fast bowler — a once-in-a-generation moment rarely seen in cricket.",
    animation_url: "bafybeibe7q4vus5e5t3lyjyermbtquzpvmkbddskcmdxvsuqkurzkvjzfa",
    attributes: [
      { trait_type: "Tournament", value: "PSL 11" },
      { trait_type: "Match", value: "Match 06" },
      { trait_type: "Fixture", value: "Karachi Kings vs Lahore Qalandars" },
      { trait_type: "Player", value: "Mir Hamza" },
      { trait_type: "Player ID", value: "mir_hamza" },
      { trait_type: "Moment Type", value: "Catch" },
      { trait_type: "Rarity Note", value: "Fast bowler catch off own bowling" },
      { trait_type: "Tier", value: "RARE" },
    ],
  }, { teamIndex: 1 }),

  fromMeta('PSL11-M15-001', {
    name: "Kusal Perera's Gritty Half-Century — PSL 11 Match 15",
    description: "On a treacherous pitch where most batters couldn't reach double figures, Kusal Perera stood firm and completed his half-century in style.",
    animation_url: "bafybeigynln3s2nswbgakl2gyijhzjyfgg3tixa27exikhce2qq62urldy",
    attributes: [
      { trait_type: "Tournament", value: "PSL 11" },
      { trait_type: "Match", value: "Match 15" },
      { trait_type: "Fixture", value: "Peshawar Zalmi vs Hyderabad Kingsmen" },
      { trait_type: "Player", value: "Kusal Perera" },
      { trait_type: "Player ID", value: "kusal_perera" },
      { trait_type: "Moment Type", value: "Half Century" },
      { trait_type: "Milestone", value: "50+" },
      { trait_type: "Tier", value: "UNCOMMON" },
    ],
  }, { teamIndex: 1 }),

  fromMeta('PSL11-M15-002', {
    name: "Sufyan Muqeem's National Team Statement — PSL 11 Match 15",
    description: "Sufyan Muqeem takes his 3rd wicket of the over, sending a loud message to the national selectors.",
    animation_url: "bafybeigwzyof3mgg27hqyseflza22gc6qvzgonigh6sajf2urwlvswxrr4",
    attributes: [
      { trait_type: "Tournament", value: "PSL 11" },
      { trait_type: "Match", value: "Match 15" },
      { trait_type: "Fixture", value: "Peshawar Zalmi vs Hyderabad Kingsmen" },
      { trait_type: "Player", value: "Sufyan Muqeem" },
      { trait_type: "Player ID", value: "sufyan_muqeem" },
      { trait_type: "Moment Type", value: "Wicket" },
      { trait_type: "Wickets", value: 3 },
      { trait_type: "Tier", value: "UNCOMMON" },
    ],
  }, { teamIndex: 1 }),

  fromMeta('PSL11-M15-003', {
    name: "Iftikhar Seals It — Last Over Heroics — PSL 11 Match 15",
    description: "Iftikhar Ahmad leads Peshawar Zalmi to victory with a brilliant last-over knock, sealing it with a four and a six.",
    animation_url: "bafybeicze23w2eot7rcfwist7c62a5akmset36vxsa3gdqaotyvd75bwyu",
    attributes: [
      { trait_type: "Tournament", value: "PSL 11" },
      { trait_type: "Match", value: "Match 15" },
      { trait_type: "Fixture", value: "Peshawar Zalmi vs Hyderabad Kingsmen" },
      { trait_type: "Player", value: "Iftikhar Ahmad" },
      { trait_type: "Player ID", value: "iftikhar_ahmad" },
      { trait_type: "Moment Type", value: "Match Winning Knock" },
      { trait_type: "Shots", value: "Four + Six" },
      { trait_type: "Tier", value: "EPIC" },
    ],
  }, { teamIndex: 0 }),

  fromMeta('PSL11-M15-004', {
    name: "Iftikhar's Four-Wicket Blitz — PSL 11 Match 15",
    description: "A legendary bowling display: Iftikhar Ahmad, a part-time bowler, takes his 4th wicket — his 3rd in the over — as Hyderabad Kingsmen collapse.",
    animation_url: "bafybeid6socjnqoh27cs3yzpdoio3a5wcznruem4fq6amqmhapa6kmawwy",
    attributes: [
      { trait_type: "Tournament", value: "PSL 11" },
      { trait_type: "Match", value: "Match 15" },
      { trait_type: "Fixture", value: "Peshawar Zalmi vs Hyderabad Kingsmen" },
      { trait_type: "Player", value: "Iftikhar Ahmad" },
      { trait_type: "Player ID", value: "iftikhar_ahmad" },
      { trait_type: "Moment Type", value: "Wicket" },
      { trait_type: "Wickets", value: 4 },
      { trait_type: "Over", value: 5 },
      { trait_type: "Tier", value: "LEGENDARY" },
    ],
  }, { teamIndex: 0 }),

];

export const MARKETPLACE_LISTINGS = MOCK_NFTS.filter(n => n.listed);