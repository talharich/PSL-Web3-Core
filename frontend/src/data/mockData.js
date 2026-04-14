export const navItems = [
  { key: "fantasy", label: "Fantasy League" },
  { key: "team", label: "My Team" },
  { key: "marketplace", label: "Marketplace" },
  { key: "stats", label: "Stats" },
];

const sampleNames = [
  "Babar Azam",
  "Rizwan",
  "Shaheen",
  "Shadab",
  "Naseem",
  "Wasim Jr.",
  "Rauf",
  "Dahani",
  "Imad",
  "Zaman",
  "Noman",
  "Farhan",
  "Agha",
  "Saim",
  "Miller",
  "Iftikhar",
];

export const players = sampleNames.map((name, index) => {
  const rarity = index % 4 === 0 ? "legendary" : "common";
  return {
    id: `p-${index + 1}`,
    name,
    role: ["Batsman", "Bowler", "All-Rounder"][index % 3],
    team: ["Lahore", "Karachi", "Islamabad", "Multan"][index % 4],
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
