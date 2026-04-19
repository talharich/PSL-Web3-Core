/**
 * mockData.js — Real PSL 11 moments sourced from the uploaded metadata JSON files.
 *
 * TIER_CONFIG  — colour + score range used throughout every component.
 * MOCK_NFTS    — the 7 real moments used as offline fallback when API is unreachable.
 * PLAYERS      — player profile data derived from the NFT metadata.
 *
 * Media via public IPFS gateway. animation_url → video, thumbnail → image.
 */

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

function ipfs(cid) {
  return cid ? `${IPFS_GATEWAY}${cid}` : null;
}

// ─── Tier configuration ───────────────────────────────────────────────────────
export const TIER_CONFIG = {
  COMMON: { label: 'Common', color: '#94a3b8', min: 0,   max: 299,  supply: 1000 },
  UNCOMMON:{ label: 'Uncommon', color: '#4ade80', min: 300, max: 499,  supply: 500  },
  RARE:    { label: 'Rare',    color: '#60a5fa', min: 500, max: 649,  supply: 250  },
  EPIC:    { label: 'Epic',    color: '#c084fc', min: 650, max: 799,  supply: 100  },
  LEGENDARY:{ label: 'Legendary', color: '#fb923c', min: 800, max: 899, supply: 50 },
  LEGEND:  { label: 'Legend',  color: '#fb923c', min: 800, max: 899,  supply: 50   },
  ICON:    { label: 'Icon',    color: '#22c55e', min: 900, max: 1000, supply: 10   },
};

// ─── 7 Real PSL 11 moments ────────────────────────────────────────────────────
export const MOCK_NFTS = [

  // common1.json — Shaheen dismisses Warner
  {
    eventId:  'EVT-PSL11-M06-001',   // ← ADD THIS
    tokenId:        '001',
    playerId:       'shaheen_afridi',
    playerName:     'Shaheen Shah Afridi',
    team:           'Lahore Qalandars',
    moment:         'Shaheen Breaks Through — Warner Dismissed',
    stat:           'Dismissed David Warner in the El Clasico',
    matchContext:   'Karachi Kings vs Lahore Qalandars · Match 06 · PSL 11',
    score:          220,
    tier:           'COMMON',
    mintRarity:     850,
    estimatedValue: 15,
    listPrice:      15,
    listed:         true,
    narrative:      'Shaheen Shah Afridi provides the breakthrough for Lahore Qalandars, dismissing the dangerous David Warner in a high-voltage El Clasico between Karachi Kings and Lahore Qalandars.',
    upgradeHistory: [],
    scoreComponents: { form: 80, milestone: 60, popularity: 50, rarity: 30 },
    image:          ipfs('bafybeienl3vrtirsgagq354z2iulgspekuq3x2ldc2vwnzkvo4t2zcwlne'),
    video:          ipfs('bafybeiddhxh2ohri763ei6sltwwxdnk7xtz4sqv5isfxgrll5uli5x5wfa'),
    momentType:     'Wicket',
    batter:         'David Warner',
    fixture:        'Karachi Kings vs Lahore Qalandars',
    match:          'Match 06',
    tournament:     'PSL 11',
  },

  // common2.json — Shaheen's 4th wicket
  {
    eventId:  'EVT-PSL11-M06-002',
    tokenId:        '002',
    playerId:       'shaheen_afridi',
    playerName:     'Shaheen Shah Afridi',
    team:           'Lahore Qalandars',
    moment:         "Shaheen's 4th Wicket — Epic Comeback Ignited",
    stat:           '4-wicket spell that sparked the Lahore comeback',
    matchContext:   'Karachi Kings vs Lahore Qalandars · Match 06 · PSL 11',
    score:          260,
    tier:           'COMMON',
    mintRarity:     820,
    estimatedValue: 20,
    listPrice:      20,
    listed:         true,
    narrative:      "Shaheen Shah Afridi picks up his fourth wicket of the spell, setting the stage for a stunning Lahore Qalandars comeback against their fiercest rivals, Karachi Kings.",
    upgradeHistory: [],
    scoreComponents: { form: 95, milestone: 75, popularity: 55, rarity: 35 },
    image:          ipfs('bafybeienl3vrtirsgagq354z2iulgspekuq3x2ldc2vwnzkvo4t2zcwlne'),
    video:          ipfs('bafybeihtkxkpxk4rx6gjqipgz2da7cnje4ttaufvyihq2ghezrub5hpgbu'),
    momentType:     'Wicket',
    wickets:        4,
    spell:          '4-wicket spell',
    fixture:        'Karachi Kings vs Lahore Qalandars',
    match:          'Match 06',
    tournament:     'PSL 11',
  },

  // uncommon1.json — Kusal Perera half century
  {
    eventId:  'EVT-PSL11-M15-001',
    tokenId:        '003',
    playerId:       'kusal_perera',
    playerName:     'Kusal Perera',
    team:           'Hyderabad Kingsmen',
    moment:         "Kusal Perera's Gritty Half-Century",
    stat:           '50+ on a treacherous pitch — masterclass in temperament',
    matchContext:   'Peshawar Zalmi vs Hyderabad Kingsmen · Match 15 · PSL 11',
    score:          350,
    tier:           'UNCOMMON',
    mintRarity:     700,
    estimatedValue: 35,
    listPrice:      35,
    listed:         true,
    narrative:      "On a treacherous pitch where most batters couldn't reach double figures, Kusal Perera stood firm at one end and completed his half-century in style. A masterclass in temperament and skill.",
    upgradeHistory: [],
    scoreComponents: { form: 120, milestone: 90, popularity: 80, rarity: 60 },
    image:          ipfs('bafybeiaq5o3tci2rkff3ud3hwzfyq47rmiggw4downdciruph4mh6snjgu'),
    video:          ipfs('bafybeigynln3s2nswbgakl2gyijhzjyfgg3tixa27exikhce2qq62urldy'),
    momentType:     'Half Century',
    milestone:      '50+',
    fixture:        'Peshawar Zalmi vs Hyderabad Kingsmen',
    match:          'Match 15',
    tournament:     'PSL 11',
  },

  // uncommon2.json — Sufyan Muqeem 3 wickets
  { 
    eventId:  'EVT-PSL11-M15-002',
    tokenId:        '004',
    playerId:       'sufyan_muqeem',
    playerName:     'Sufyan Muqeem',
    team:           'Peshawar Zalmi',
    moment:         "Sufyan Muqeem's National Team Statement",
    stat:           '3 wickets in an over — a message to the selectors',
    matchContext:   'Peshawar Zalmi vs Hyderabad Kingsmen · Match 15 · PSL 11',
    score:          380,
    tier:           'UNCOMMON',
    mintRarity:     680,
    estimatedValue: 40,
    listPrice:      40,
    listed:         true,
    narrative:      "Sufyan Muqeem takes his 3rd wicket of the over, sending a loud and clear message to the national selectors. A spell that announced his arrival on the big stage.",
    upgradeHistory: [],
    scoreComponents: { form: 130, milestone: 95, popularity: 85, rarity: 70 },
    image:          ipfs('bafkreiapw2ycxvkuxtieglbr276jk3zcexsyda3nlsxfvz7p2unrklhlga'),
    video:          ipfs('bafybeigwzyof3mgg27hqyseflza22gc6qvzgonigh6sajf2urwlvswxrr4'),
    momentType:     'Wicket',
    wickets:        3,
    fixture:        'Peshawar Zalmi vs Hyderabad Kingsmen',
    match:          'Match 15',
    tournament:     'PSL 11',
  },

  // Rare1.json — Mir Hamza bullet catch
  {
    eventId:  'EVT-PSL11-M06-003',
    tokenId:        '005',
    playerId:       'mir_hamza',
    playerName:     'Mir Hamza',
    team:           'Lahore Qalandars',
    moment:         "Mir Hamza's Bullet Catch",
    stat:           'Spectacular caught-and-bowled — fast bowler grabs a bullet drive',
    matchContext:   'Karachi Kings vs Lahore Qalandars · Match 06 · PSL 11',
    score:          560,
    tier:           'RARE',
    mintRarity:     500,
    estimatedValue: 75,
    listPrice:      75,
    listed:         true,
    narrative:      "A once-in-a-generation moment. Mir Hamza pulls off a spectacular catch as a fast bowler, grabbing a bullet-paced drive hit directly back at him. A moment very rarely seen in cricket.",
    upgradeHistory: [],
    scoreComponents: { form: 170, milestone: 140, popularity: 130, rarity: 120 },
    image:          ipfs('bafybeihde5c3pcg4n2h3yz7hkzobym6cizyl2s2al5ddnt3afkh37yt5ou'),
    video:          ipfs('bafybeibe7q4vus5e5t3lyjyermbtquzpvmkbddskcmdxvsuqkurzkvjzfa'),
    momentType:     'Catch',
    rarityNote:     'Fast bowler catch off own bowling',
    fixture:        'Karachi Kings vs Lahore Qalandars',
    match:          'Match 06',
    tournament:     'PSL 11',
  },

  // epic1.json — Iftikhar last-over heroics
  {
    eventId:  'EVT-PSL11-M15-003',
    tokenId:        '006',
    playerId:       'iftikhar_ahmad',
    playerName:     'Iftikhar Ahmad',
    team:           'Peshawar Zalmi',
    moment:         'Iftikhar Seals It — Last Over Heroics',
    stat:           'A four and a six in the last over to seal the win',
    matchContext:   'Peshawar Zalmi vs Hyderabad Kingsmen · Match 15 · PSL 11',
    score:          700,
    tier:           'EPIC',
    mintRarity:     350,
    estimatedValue: 120,
    listPrice:      120,
    listed:         true,
    narrative:      "Iftikhar Ahmad leads Peshawar Zalmi to victory with a brilliant last-over knock, sealing the win with a four and a six. A captain's innings when it mattered most.",
    upgradeHistory: [],
    scoreComponents: { form: 220, milestone: 180, popularity: 160, rarity: 140 },
    image:          ipfs('bafybeicafrbp62n4wux7inswyxffjetvisbolbd6jxxymioawbvrjt46ku'),
    video:          ipfs('bafybeicze23w2eot7rcfwist7c62a5akmset36vxsa3gdqaotyvd75bwyu'),
    momentType:     'Match Winning Knock',
    shots:          'Four + Six',
    over:           'Last Over',
    fixture:        'Peshawar Zalmi vs Hyderabad Kingsmen',
    match:          'Match 15',
    tournament:     'PSL 11',
  },

  // legendary1.json — Iftikhar 4-wicket blitz
  {
    eventId:  'EVT-PSL11-M15-004',
    tokenId:        '007',
    playerId:       'iftikhar_ahmad',
    playerName:     'Iftikhar Ahmad',
    team:           'Peshawar Zalmi',
    moment:         "Iftikhar's Four-Wicket Blitz",
    stat:           '4 wickets including 3 in a single over as a part-timer',
    matchContext:   'Peshawar Zalmi vs Hyderabad Kingsmen · Match 15 · PSL 11',
    score:          850,
    tier:           'LEGENDARY',
    mintRarity:     150,
    estimatedValue: 250,
    listPrice:      250,
    listed:         true,
    narrative:      "The fifth over of the first innings and Iftikhar Ahmad, a part-time bowler, has taken his 4th wicket — his 3rd in the over — as Hyderabad Kingsmen collapse to lose their fourth wicket. A legendary bowling display from an unlikely hero.",
    upgradeHistory: [],
    scoreComponents: { form: 280, milestone: 220, popularity: 200, rarity: 150 },
    image:          ipfs('bafybeicafrbp62n4wux7inswyxffjetvisbolbd6jxxymioawbvrjt46ku'),
    video:          ipfs('bafybeid6socjnqoh27cs3yzpdoio3a5wcznruem4fq6amqmhapa6kmawwy'),
    momentType:     'Wicket',
    wickets:        4,
    over:           5,
    fixture:        'Peshawar Zalmi vs Hyderabad Kingsmen',
    match:          'Match 15',
    tournament:     'PSL 11',
  },
];

// ─── Player profiles ──────────────────────────────────────────────────────────
// Used by PlayerStats.jsx for /player/:playerId pages.
export const PLAYERS = [
  {
    id:          'shaheen_afridi',
    name:        'Shaheen Shah Afridi',
    team:        'Lahore Qalandars',
    role:        'Bowler',
    nationality: 'Pakistan',
    emoji:       '🎳',
    milestones:  ['five_wicket_haul', 'national_squad'],
  },
  {
    id:          'kusal_perera',
    name:        'Kusal Perera',
    team:        'Hyderabad Kingsmen',
    role:        'Batter',
    nationality: 'Sri Lanka',
    emoji:       '🏏',
    milestones:  ['half_century'],
  },
  {
    id:          'sufyan_muqeem',
    name:        'Sufyan Muqeem',
    team:        'Peshawar Zalmi',
    role:        'Bowler',
    nationality: 'Pakistan',
    emoji:       '🎳',
    milestones:  ['national_squad'],
  },
  {
    id:          'mir_hamza',
    name:        'Mir Hamza',
    team:        'Lahore Qalandars',
    role:        'Bowler',
    nationality: 'Pakistan',
    emoji:       '🎳',
    milestones:  [],
  },
  {
    id:          'iftikhar_ahmad',
    name:        'Iftikhar Ahmad',
    team:        'Peshawar Zalmi',
    role:        'All-rounder',
    nationality: 'Pakistan',
    emoji:       '⚡',
    milestones:  ['player_of_match', 'national_squad'],
  },
];