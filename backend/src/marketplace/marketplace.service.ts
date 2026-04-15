import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ChainProvider } from '../common/chain.provider';
import { EventsGateway } from '../events/events.gateway';
import { TIER_NAMES } from '../common/abi/contracts';
import { ethers } from 'ethers';

export interface Listing {
  tokenId: number;
  seller: string;
  price: string;       // formatted ETH string
  priceWei: string;
  tier: string;
  playerId: string;
  tokenUri: string;
}

export interface SaleRecord {
  tokenId: number;
  buyer: string;
  seller: string;
  price: string;
  royalty: string;        // 10% to player TBA
  platformFee: string;    // 5% to yield contract
  sellerProceeds: string; // 85%
  txHash: string;
  blockNumber: number;
  timestamp: string;
}

@Injectable()
export class MarketplaceService implements OnModuleInit {
  private readonly logger = new Logger(MarketplaceService.name);

  // RPC providers cap eth_getLogs at 10,000 blocks per query — stay under it
  private readonly BLOCK_CHUNK = 9_500;

  // In-memory sale history cache — in production use a database
  private saleHistory: SaleRecord[] = [];
  private listingCache: Map<number, Listing> = new Map();

  // Track the block at which contracts were deployed so we don't scan from 0
  private deployBlock: number | null = null;

  constructor(
    private readonly chain: ChainProvider,
    private readonly eventsGateway: EventsGateway,
  ) {}

  onModuleInit() {
    this.startEventListeners();

    // Re-attach listeners if the provider reconnects
    this.chain.onReconnect = () => {
      this.logger.warn('Reconnected — re-attaching marketplace listeners');
      this.startEventListeners();
    };
  }

  // ── Paginated log fetcher ─────────────────────────────────────────────────
  // Splits any [fromBlock, latest] range into 9,500-block chunks to stay within
  // the RPC provider's 10,000-block eth_getLogs limit.
  private async fetchLogsInChunks(
    filter: ethers.ContractEventName,
    contract: ethers.Contract,
  ): Promise<ethers.EventLog[]> {
    const fromBlock = this.deployBlock ?? 0;
    const latestBlock = await this.chain.provider.getBlockNumber();

    if (fromBlock > latestBlock) return [];

    const chunks: Array<{ from: number; to: number }> = [];
    for (let start = fromBlock; start <= latestBlock; start += this.BLOCK_CHUNK) {
      chunks.push({
        from: start,
        to: Math.min(start + this.BLOCK_CHUNK - 1, latestBlock),
      });
    }

    // Fetch chunks sequentially to respect rate limits on free-tier RPCs.
    // Switch to Promise.all batches if you're on a paid plan and need speed.
    const allEvents: ethers.EventLog[] = [];
    for (const { from, to } of chunks) {
      try {
        const events = await contract.queryFilter(filter, from, to);
        allEvents.push(...(events as ethers.EventLog[]));
      } catch (err) {
        this.logger.warn(
          `Log chunk [${from}–${to}] failed: ${err.message} — skipping chunk`,
        );
      }
    }

    return allEvents;
  }

  // ── Active listings ───────────────────────────────────────────────────────
  async getActiveListings(): Promise<Listing[]> {
    const events = await this.fetchLogsInChunks(
      this.chain.marketplaceContract.filters.Listed(),
      this.chain.marketplaceContract,
    );

    const listings: Listing[] = [];

    for (const event of events) {
      const tokenId = Number((event as any).args?.tokenId ?? 0);
      if (!tokenId && tokenId !== 0) continue;

      try {
        const listing = await this.chain.marketplaceContract.listings(tokenId);
        if (!listing.active) continue;

        const [tierRaw, playerIdStr, tokenUri] = await Promise.all([
          this.chain.nftContract.tokenTier(tokenId),
          this.chain.nftContract.tokenPlayer(tokenId),
          this.chain.nftContract.tokenURI(tokenId),
        ]);

        listings.push({
          tokenId,
          seller: listing.seller,
          price: ethers.formatEther(listing.price),
          priceWei: listing.price.toString(),
          tier: TIER_NAMES[Number(tierRaw)] ?? 'COMMON',
          playerId: playerIdStr,
          tokenUri,
        });
      } catch (err) {
        this.logger.warn(`Failed to fetch listing for token ${tokenId}: ${err.message}`);
      }
    }

    return listings;
  }

  // ── Single listing ────────────────────────────────────────────────────────
  async getListing(tokenId: number): Promise<Listing | null> {
    if (this.listingCache.has(tokenId)) return this.listingCache.get(tokenId);

    try {
      const listing = await this.chain.marketplaceContract.listings(tokenId);
      if (!listing.active) return null;

      const [tierRaw, playerIdStr, tokenUri] = await Promise.all([
        this.chain.nftContract.tokenTier(tokenId),
        this.chain.nftContract.tokenPlayer(tokenId),
        this.chain.nftContract.tokenURI(tokenId),
      ]);

      const result: Listing = {
        tokenId,
        seller: listing.seller,
        price: ethers.formatEther(listing.price),
        priceWei: listing.price.toString(),
        tier: TIER_NAMES[Number(tierRaw)] ?? 'COMMON',
        playerId: playerIdStr,
        tokenUri,
      };

      this.listingCache.set(tokenId, result);
      return result;
    } catch (_) {
      return null;
    }
  }

  // ── Sale history from on-chain Sold events ────────────────────────────────
  async getSaleHistory(tokenId?: number): Promise<SaleRecord[]> {
    try {
      const filter = tokenId
        ? this.chain.marketplaceContract.filters.Sold(tokenId)
        : this.chain.marketplaceContract.filters.Sold();

      const events = await this.fetchLogsInChunks(filter, this.chain.marketplaceContract);
      const records: SaleRecord[] = [];

      for (const event of events) {
        const args = (event as any).args;
        if (!args) continue;

        // Filter by tokenId if requested
        if (tokenId !== undefined && Number(args.tokenId) !== tokenId) continue;

        const price = BigInt(args.price ?? 0);
        const royalty = (price * BigInt(10)) / BigInt(100);
        const platformFee = (price * BigInt(5)) / BigInt(100);
        const sellerProceeds = price - royalty - platformFee;

        const block = await event.getBlock();

        records.push({
          tokenId: Number(args.tokenId),
          buyer: args.buyer,
          seller: args.seller ?? '',
          price: ethers.formatEther(price),
          royalty: ethers.formatEther(royalty),
          platformFee: ethers.formatEther(platformFee),
          sellerProceeds: ethers.formatEther(sellerProceeds),
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
        });
      }

      return records.sort((a, b) => b.blockNumber - a.blockNumber);
    } catch (err) {
      this.logger.error('getSaleHistory failed', err.message);
      return this.saleHistory.filter((r) => !tokenId || r.tokenId === tokenId);
    }
  }

  // ── Platform stats ────────────────────────────────────────────────────────
  async getPlatformStats() {
    const [allSales, allListings, totalAccumulated] = await Promise.all([
      this.getSaleHistory(),
      this.getActiveListings(),
      this.getTotalYieldAccumulated(),
    ]);

    const totalVolume = allSales.reduce((sum, s) => sum + parseFloat(s.price), 0);
    const totalRoyaltiesPaid = allSales.reduce((sum, s) => sum + parseFloat(s.royalty), 0);

    return {
      totalSales: allSales.length,
      totalVolumeEth: totalVolume.toFixed(4),
      totalRoyaltiesPaidEth: totalRoyaltiesPaid.toFixed(4),
      activeListings: allListings.length,
      yieldAccumulatedEth: totalAccumulated,
    };
  }

  async getTotalYieldAccumulated(): Promise<string> {
    try {
      const raw = await this.chain.yieldContract.totalAccumulated();
      return ethers.formatEther(raw);
    } catch (_) {
      return '0';
    }
  }

  async getClaimableYield(tokenId: number): Promise<string> {
    try {
      const raw = await this.chain.yieldContract.claimableByToken(tokenId);
      return ethers.formatEther(raw);
    } catch (_) {
      return '0';
    }
  }

  // ── Listings by player ────────────────────────────────────────────────────
  async getListingsByPlayer(playerId: string): Promise<Listing[]> {
    const all = await this.getActiveListings();
    return all.filter((l) => l.playerId === playerId);
  }

  // ── Set the deploy block so we don't scan from block 0 ───────────────────
  // Call this from the module init after you know your contract deploy block.
  // Example: set MARKETPLACE_DEPLOY_BLOCK in your .env and pass it here.
  setDeployBlock(block: number) {
    this.deployBlock = block;
    this.logger.log(`Marketplace deploy block set to: ${block}`);
  }

  // ── Real-time event listeners ─────────────────────────────────────────────
  private startEventListeners() {
    this.chain.marketplaceContract.on('Listed', (tokenId, seller, price) => {
      this.listingCache.delete(Number(tokenId));
      this.logger.log(`New listing: token ${tokenId} at ${ethers.formatEther(price)} ETH`);
      this.eventsGateway.broadcastListing({
        tokenId: Number(tokenId),
        seller,
        price: ethers.formatEther(price),
      });
    });

    this.chain.marketplaceContract.on('Sold', async (tokenId, buyer, price, _royalty, _fee, event) => {
      this.listingCache.delete(Number(tokenId));
      const priceWei = BigInt(price);
      const royalty = (priceWei * BigInt(10)) / BigInt(100);
      const platformFee = (priceWei * BigInt(5)) / BigInt(100);

      const record: SaleRecord = {
        tokenId: Number(tokenId),
        buyer,
        seller: '',
        price: ethers.formatEther(priceWei),
        royalty: ethers.formatEther(royalty),
        platformFee: ethers.formatEther(platformFee),
        sellerProceeds: ethers.formatEther(priceWei - royalty - platformFee),
        txHash: event?.transactionHash ?? '',
        blockNumber: event?.blockNumber ?? 0,
        timestamp: new Date().toISOString(),
      };

      this.saleHistory.unshift(record);

      this.eventsGateway.broadcastSale({
        tokenId: Number(tokenId),
        buyer,
        price: record.price,
        royalty: record.royalty,
        platformFee: record.platformFee,
        txHash: record.txHash,
      });
    });

    this.logger.log('Marketplace event listeners started');
  }
}