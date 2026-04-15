import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

export interface CricketEvent {
  eventId: string;
  playerId: string;
  playerName: string;
  team: string;
  fixture?: string;
  tournament?: string;
  match?: string;
  eventType: 'BATTING_MILESTONE' | 'BOWLING_MILESTONE';
  stat: string;
  momentType?: string;
  runs?: number;
  ballsFaced?: number;
  strikeRate?: number;
  fours?: number;
  sixes?: number;
  wickets?: number;
  economy?: number;
  matchContext: string;
  rarityTrigger: string;
  matchId?: string;
  name?: string;
  description?: string;
  // Pre-uploaded Pinata CIDs (no prefix — just the raw CID)
  animation_url?: string;
  thumbnail?: string;
  isDeadshot?: boolean;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  animation_url: string;
  external_url: string;
  attributes: { trait_type: string; value: string | number }[];
}

@Injectable()
export class MetadataService {
  private readonly logger = new Logger(MetadataService.name);

  constructor(private readonly config: ConfigService) {}

  // ─── Cricket API ──────────────────────────────────────────────

  async fetchLiveMatches(): Promise<any[]> {
    const { key, baseUrl, seriesId } = this.config.get('cricapi');
    try {
      const res = await axios.get(`${baseUrl}/series_info`, {
        params: { apikey: key, id: seriesId },
      });
      return res.data?.data?.matchList ?? [];
    } catch (err) {
      this.logger.error('CricAPI fetchLiveMatches failed', err.message);
      return [];
    }
  }

  async fetchPlayerStats(playerId: string): Promise<any> {
    const { key, baseUrl } = this.config.get('cricapi');
    try {
      const res = await axios.get(`${baseUrl}/players_info`, {
        params: { apikey: key, id: playerId },
      });
      return res.data?.data ?? null;
    } catch (err) {
      this.logger.error(`CricAPI fetchPlayerStats failed for ${playerId}`, err.message);
      return null;
    }
  }

  async fetchMatchScorecard(matchId: string): Promise<any> {
    const { key, baseUrl } = this.config.get('cricapi');
    try {
      const res = await axios.get(`${baseUrl}/match_scorecard`, {
        params: { apikey: key, id: matchId },
      });
      return res.data?.data ?? null;
    } catch (err) {
      this.logger.error(`CricAPI fetchMatchScorecard failed for ${matchId}`, err.message);
      return null;
    }
  }

  // ─── Metadata generation ─────────────────────────────────────

  buildDescription(event: CricketEvent): string {
    // Use the pre-written description from moments.json if available
    if (event.description) return event.description;

    if (event.eventType === 'BATTING_MILESTONE') {
      const sr = event.strikeRate?.toFixed(1) ?? 'N/A';
      const balls = event.ballsFaced ?? 'N/A';
      const fours = event.fours ?? 0;
      const sixes = event.sixes ?? 0;

      if (event.stat === 'six_sixes') {
        return `${event.playerName} achieved the unthinkable — six sixes in a single over. ` +
          `${event.matchContext}. Only ${this.getRarityCardCount(event.rarityTrigger)} card${this.getRarityCardCount(event.rarityTrigger) > 1 ? 's exist' : ' exists'} in existence.`;
      }
      if (event.stat === 'half_century') {
        return `${event.playerName} blazed ${event.runs ?? 50}+ runs at a strike rate of ${sr}. ` +
          `${event.matchContext}.`;
      }
      if (event.stat === 'century') {
        return `${event.playerName} carved a breathtaking century — ${event.runs} runs off ${balls} balls ` +
          `at a strike rate of ${sr}. ${fours} boundaries and ${sixes} maximums. ${event.matchContext}.`;
      }
      return `${event.playerName} delivered ${event.runs ?? 0} runs at a strike rate of ${sr}. ${event.matchContext}.`;
    }

    const econ = event.economy?.toFixed(2) ?? 'N/A';
    if (event.stat === 'hat_trick') {
      return `${event.playerName} completed a hat-trick — three wickets in three balls. ` +
        `${event.matchContext}. A moment that stopped the stadium.`;
    }
    if (event.stat === 'five_wicket_haul') {
      return `${event.playerName} ripped through the batting order — ${event.wickets} wickets ` +
        `at an economy of ${econ}. ${event.matchContext}.`;
    }
    return `${event.playerName} claimed ${event.wickets ?? 1} wicket(s) at ${econ} economy. ${event.matchContext}.`;
  }

  /**
   * Build the full ERC-721 metadata JSON.
   * Prefers event.animation_url / event.thumbnail CIDs (already on Pinata)
   * over placeholder values.
   */
  buildMetadata(event: CricketEvent, _fallbackImageCid?: string): NFTMetadata {
    const tierName = event.rarityTrigger;
    const description = this.buildDescription(event);

    // Use pre-uploaded CIDs when available
    const imageCid = event.thumbnail ?? _fallbackImageCid ?? 'QmPlaceholderThumbnail';
    const animationCid = event.animation_url ?? _fallbackImageCid ?? 'QmPlaceholderAnimation';

    const attributes: { trait_type: string; value: string | number }[] = [
      { trait_type: 'Player',        value: event.playerName },
      { trait_type: 'Player ID',     value: event.playerId },
      { trait_type: 'Team',          value: event.team },
      { trait_type: 'Tier',          value: tierName },
      { trait_type: 'Moment Type',   value: event.momentType ?? event.stat.replace(/_/g, ' ') },
      { trait_type: 'Tournament',    value: event.tournament ?? 'PSL 11' },
      { trait_type: 'Match',         value: event.match ?? 'Unknown' },
      { trait_type: 'Fixture',       value: event.fixture ?? event.matchContext },
    ];

    if (event.eventType === 'BATTING_MILESTONE') {
      if (event.runs     != null) attributes.push({ trait_type: 'Runs',        value: event.runs });
      if (event.ballsFaced != null) attributes.push({ trait_type: 'Balls',     value: event.ballsFaced });
      if (event.strikeRate != null) attributes.push({ trait_type: 'Strike Rate', value: Math.floor(event.strikeRate) });
      if (event.fours    != null) attributes.push({ trait_type: 'Fours',       value: event.fours });
      if (event.sixes    != null) attributes.push({ trait_type: 'Sixes',       value: event.sixes });
    } else {
      if (event.wickets  != null) attributes.push({ trait_type: 'Wickets',     value: event.wickets });
      if (event.economy  != null) attributes.push({ trait_type: 'Economy',     value: event.economy.toFixed(2) });
    }

    return {
      name: event.name ?? `${event.playerName} — ${event.stat.replace(/_/g, ' ')} (${tierName})`,
      description,
      image:         `ipfs://${imageCid}`,
      animation_url: `ipfs://${animationCid}`,
      external_url:  `https://psldynamicnft.com/nft/${event.eventId}`,
      attributes,
    };
  }

  // ─── IPFS ─────────────────────────────────────────────────────

  /**
   * Pins only the metadata JSON to Pinata.
   * The video and thumbnail are already pinned — we just reference their CIDs.
   */
  async pinMetadata(event: CricketEvent, fallbackImageCid?: string): Promise<string> {
    const metadata = this.buildMetadata(event, fallbackImageCid);
    const { apiKey, secretKey } = this.config.get('pinata');

    // If no Pinata keys configured, return a deterministic fallback URI
    if (!apiKey || !secretKey) {
      this.logger.warn('Pinata keys not set — returning fallback IPFS URI');
      return `ipfs://${event.animation_url ?? 'QmFallback_' + event.eventId}`;
    }

    try {
      const res = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        {
          pinataContent: metadata,
          pinataMetadata: {
            name: `metadata_${event.playerId}_${event.eventId}_${event.rarityTrigger}.json`,
          },
        },
        {
          headers: {
            pinata_api_key: apiKey,
            pinata_secret_api_key: secretKey,
          },
        },
      );

      const uri = `ipfs://${res.data.IpfsHash}`;
      this.logger.log(`Pinned metadata for ${event.playerId} [${event.eventId}]: ${uri}`);
      return uri;
    } catch (err) {
      this.logger.error('Pinata pin failed', err.message);
      // Graceful fallback: use the animation_url CID as the tokenURI
      return `ipfs://${event.animation_url ?? 'QmFallback_' + event.eventId}`;
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────

  private getRarityCardCount(tier: string): number {
    const caps: Record<string, number> = {
      COMMON: 10000, UNCOMMON: 1000, RARE: 100, EPIC: 10, LEGENDARY: 3,
    };
    return caps[tier] ?? 1;
  }

  /**
   * Returns a Pinata gateway URL for display (not used for on-chain tokenURI).
   * Kept for backwards-compat with any controller that calls this.
   */
  getTierImageCid(tier: string): string {
    // These are no longer used for media since each moment has its own CIDs.
    // Return empty string — callers should prefer event.thumbnail directly.
    return '';
  }

  /** Returns the full Pinata gateway URL for a raw CID */
  static gatewayUrl(cid: string): string {
    return `${PINATA_GATEWAY}${cid}`;
  }
}