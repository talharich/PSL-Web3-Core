export const navItems = [
  { key: "fantasy", label: "Fantasy League" },
  { key: "team", label: "My Team" },
  { key: "marketplace", label: "Marketplace" },
  { key: "stats", label: "Stats" },
];

const rawPlayers = [
  { name: "Babar Azam", role: "Batsman", team: "Peshawar Zalmi", momentText: "CLASSIC CENTURY", momentQuote: '"104 off 62 — sublime timing"' },
  { name: "Muhammad Rizwan", role: "Batsman", team: "Rawalpindizz", momentText: "CRUCIAL 80*", momentQuote: '"80* off 48 — anchored the chase"' },
  { name: "Shaheen Afridi", role: "Bowler", team: "Lahore Qalandars", momentText: "FIERY OPENING SPELL", momentQuote: '"3 wickets in first over"' },
  { name: "Shadab Khan", role: "All-Rounder", team: "Islamabad United", momentText: "MATCH WINNER", momentQuote: '"45 runs & 3 wickets"' },
  { name: "Naseem Shah", role: "Bowler", team: "Rawalpindizz", momentText: "LAST OVER HEROICS", momentQuote: '"Defended 6 runs in final over"' },
  { name: "Wasim Jr.", role: "Bowler", team: "Multan Sultans", momentText: "DEADLY YORKERS", momentQuote: '"4 wickets - 4.0 overs"' },
  { name: "Haris Rauf", role: "Bowler", team: "Lahore Qalandars", momentText: "DEATH MASTERCLASS", momentQuote: '"3 wickets at the death"' },
  { name: "Shahnawaz Dahani", role: "Bowler", team: "Peshawar Zalmi", momentText: "MAIDEN 5-FER", momentQuote: '"5 wickets - 4.2 overs"' },
  { name: "Imad Wasim", role: "All-Rounder", team: "Islamabad United", momentText: "UNBEATEN FINISH", momentQuote: '"30 off 10 & economical spell"' },
  { name: "Saim Ayub", role: "All-Rounder", team: "Hyderabad Kingsmen", momentText: "NO LOOK SIX", momentQuote: '"Stunning flick over square leg"' },
  { name: "Iftikhar Ahmed", role: "Batsman", team: "Peshawar Zalmi", momentText: "SIX SIXES OVER", momentQuote: '"36 runs off the spin over"' },
  { name: "Steve Smith", role: "Batsman", team: "Multan Sultans", momentText: "MASTERFUL 70", momentQuote: '"70 off 45 — steady acceleration"' },
  { name: "Irfan Niazi", role: "Batsman", team: "Hyderabad Kingsmen", momentText: "KILLER NIAZI FINISH", momentQuote: '"Match-winning 45* off 15"' },
  { name: "Fakhar Zaman", role: "Batsman", team: "Lahore Qalandars", momentText: "EXPLOSIVE OPENING", momentQuote: '"60 off 25 — explosive start"' },
  { name: "Agha Salman", role: "All-Rounder", team: "Karachi Kings", momentText: "CLUTCH MIDDLE ORDER", momentQuote: '"Solid 50 and crucial breakthrough"' },
  { name: "Sahibzada Farhan", role: "Batsman", team: "Multan Sultans", momentText: "CONSISTENT FIFTY", momentQuote: '"Solid 55 anchoring the innings"' },
];

export const players = rawPlayers.map((p, index) => {
  const rarities = ["legendary", "epic", "rare", "common"];
  const rarity = rarities[index % 4];
  return {
    id: `p-${index + 1}`,
    name: p.name,
    role: p.role,
    team: p.team,
    momentText: p.momentText,
    momentQuote: p.momentQuote,
    rating: 90 + (index % 10),
    strikeRate: 115 + index,
    economy: (6 + (index % 5) * 0.45).toFixed(2),
    points: 70 + index * 3,
    rarity,
    currentBid: `${(25000 + index * 3500).toLocaleString()} PSL`,
    buyNow: `${(45000 + index * 5000).toLocaleString()} PSL`,
    timeLeft: `${2 + (index % 7)}h ${(index * 7) % 60}m`,
  };
});

export const topBatsmen = players.slice(0, 6).map((player, idx) => ({
  name: player.name,
  runs: 150 + idx * 14,
  avg: (35 + idx * 2.1).toFixed(1),
  points: player.points + 20,
}));

export const topBowlers = players.slice(6, 12).map((player, idx) => ({
  name: player.name,
  wickets: 8 + idx * 2,
  economy: (5.7 + idx * 0.3).toFixed(2),
  points: player.points + 16,
}));
