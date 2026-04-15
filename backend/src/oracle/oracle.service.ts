import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ChainProvider } from '../common/chain.provider';
import { MetadataService, CricketEvent } from '../metadata/metadata.service';
import { EventsGateway } from '../events/events.gateway';
import { TIER_FROM_STRING, TIER_NAMES } from '../common/abi/contracts';
import * as momentsData from '../../data/moments.json';

// ─── Score calculator ─────────────────────────────────────────────────────────

const MILESTONE_POINTS: Record<string, number> = {
  half_century:       30,
  catch:              40,
  wicket:             25,
  three_wicket_burst: 60,
  four_wicket_spell:  75,
  four_wicket_blitz:  90,
  match_winning_knock:70,
  five_wicket_haul:   90,
  hat_trick:          100,
  six_sixes:          200,
  perfect_spell:      200,
  century:            80,
  player_of_match:    40,
  psl_title:          150,
  national_squad:     50,
};

interface PlayerData {
  recentMatches: { formPoints: number }[];
  milestones: { type: string; points: number }[];
  tradeVolume: number;
  maxTradeVolume: number;
  mintRarity: number;
}

export function calculatePerformanceScore(player: PlayerData): {
  total: number;
  tier: string;
  breakdown: Record<string, number>;
} {
  const last5 = player.recentMatches.slice(-5);
  const avgForm =
    last5.length > 0
      ? last5.reduce((s, m) => s + m.formPoints, 0) / last5.length
      : 0;

  const formScore      = (avgForm / 100) * 400;
  const milestoneScore = Math.min(player.milestones.reduce((s, m) => s + m.points, 0), 250);
  const popScore       = player.maxTradeVolume > 0
    ? (player.tradeVolume / player.maxTradeVolume) * 200
    : 0;
  const rarityScore    = (player.mintRarity / 100) * 150;

  const total = Math.min(Math.round(formScore + milestoneScore + popScore + rarityScore), 1000);

  return {
    total,
    tier: getTierFromScore(total),
    breakdown: { formScore, milestoneScore, popScore, rarityScore },
  };
}

function getTierFromScore(score: number): string {
  if (score >= 900) return 'LEGENDARY';
  if (score >= 700) return 'EPIC';
  if (score >= 450) return 'RARE';
  if (score >= 200) return 'UNCOMMON';
  return 'COMMON';
}

// ─── Oracle service ───────────────────────────────────────────────────────────

@Injectable()
export class OracleService {
  private readonly logger = new Logger(OracleService.name);

  constructor(
    private readonly chain: ChainProvider,
    private readonly metadataService: MetadataService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  // ── Main trigger ─────────────────────────────────────────────────────────────
  async triggerUpgrade(eventId: string): Promise<{
    txHash: string;
    newTier: string;
    tokenIds: number[];
    ipfsUri: string;
  }> {
    const event = this.findEvent(eventId);
    if (!event) throw new NotFoundException(`Event ${eventId} not found`);

    this.logger.log(`Triggering upgrade: ${event.playerName} — ${event.stat} → ${event.rarityTrigger}`);

    // Pin just the metadata JSON; media CIDs are already on Pinata
    const ipfsUri = await this.metadataService.pinMetadata(event);

    const tx = await this.chain.oracleContract.updatePlayerStats(
      event.playerId,
      event.runs ?? 0,
      Math.floor(event.strikeRate ?? 0),
      event.wickets ?? 0,
      event.rarityTrigger,
      ipfsUri,
    );
    const receipt = await tx.wait();
    const upgradedTokenIds = this.parseUpgradeEvents(receipt);

    let oldTier = 'COMMON';
    if (upgradedTokenIds.length > 0) {
      try {
        const tierNum = await this.chain.nftContract.tokenTier(upgradedTokenIds[0]);
        oldTier = TIER_NAMES[Math.max(0, Number(tierNum) - 1)] ?? 'COMMON';
      } catch (_) {}
    }

    const metadata = this.metadataService.buildMetadata(event);
    this.eventsGateway.broadcastUpgrade({
      eventId,
      playerId: event.playerId,
      playerName: event.playerName,
      newTier: event.rarityTrigger,
      oldTier,
      txHash: receipt.hash,
      tokenIds: upgradedTokenIds,
      metadata,
    });

    this.logger.log(`Upgrade complete. txHash: ${receipt.hash} | tokens: ${upgradedTokenIds}`);
    return { txHash: receipt.hash, newTier: event.rarityTrigger, tokenIds: upgradedTokenIds, ipfsUri };
  }

  // ── Deadshot mint ─────────────────────────────────────────────────────────────
  async mintAtTier(
    toAddress: string,
    playerId: string,
    tier: string,
    eventId: string,
  ): Promise<{ txHash: string; tokenId: number }> {
    const event = this.findEvent(eventId);
    if (!event) throw new NotFoundException(`Event ${eventId} not found`);

    const tierNum = TIER_FROM_STRING[tier];
    if (tierNum === undefined) throw new Error(`Unknown tier: ${tier}`);

    const ipfsUri = await this.metadataService.pinMetadata(event);

    this.logger.log(`Minting ${tier} directly for ${playerId} → ${toAddress}`);

    const tx = await this.chain.nftContract.mintAtTier(toAddress, playerId, ipfsUri, tierNum);
    const receipt = await tx.wait();
    const tokenId = this.parseMintEvent(receipt);

    this.eventsGateway.broadcastMint({
      tokenId,
      playerId,
      playerName: event.playerName,
      tier,
      txHash: receipt.hash,
    });

    return { txHash: receipt.hash, tokenId };
  }

  async registerToken(playerId: string, tokenId: number): Promise<string> {
    const tx = await this.chain.oracleContract.registerPlayerToken(playerId, tokenId);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  calculateScore(playerData: PlayerData) {
    return calculatePerformanceScore(playerData);
  }

  getMilestonePoints() {
    return MILESTONE_POINTS;
  }

  /** Returns all moments from the catalog */
  listMockEvents(): CricketEvent[] {
    return (momentsData as any).moments as CricketEvent[];
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private findEvent(eventId: string): CricketEvent | undefined {
    return ((momentsData as any).moments as CricketEvent[]).find(
      (e) => e.eventId === eventId,
    );
  }

  private parseUpgradeEvents(receipt: any): number[] {
    const iface = this.chain.oracleContract.interface;
    const tokenIds: number[] = [];
    for (const log of receipt.logs ?? []) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed?.name === 'UpgradeTriggered') tokenIds.push(Number(parsed.args.tokenId));
      } catch (_) {}
    }
    return tokenIds;
  }

  private parseMintEvent(receipt: any): number {
    const iface = this.chain.nftContract.interface;
    for (const log of receipt.logs ?? []) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed?.name === 'MomentMinted') return Number(parsed.args.tokenId);
      } catch (_) {}
    }
    return -1;
  }
}