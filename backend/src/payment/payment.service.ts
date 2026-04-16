import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe = require('stripe');
import type { Stripe as StripeTypes } from 'stripe/cjs/stripe.core';
import { ChainProvider } from '../common/chain.provider';
import { MetadataService, CricketEvent } from '../metadata/metadata.service';
import { EventsGateway } from '../events/events.gateway';
import { UsersService } from '../users/users.service';
import { TIER_FROM_STRING } from '../common/abi/contracts';
import * as momentsData from '../../data/moments.json';

// USD price per tier (also stored in moments.json rarityThresholds)
export const TIER_PRICES_USD: Record<string, number> = {
  COMMON:    25,
  UNCOMMON:  150,
  RARE:      800,
  EPIC:      3500,
  LEGENDARY: 15000,
};

// All moments from the catalog
const ALL_MOMENTS: CricketEvent[] = (momentsData as any).moments as CricketEvent[];

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private stripe: InstanceType<typeof Stripe>;

  constructor(
    private readonly config: ConfigService,
    private readonly chain: ChainProvider,
    private readonly metadataService: MetadataService,
    private readonly eventsGateway: EventsGateway,
    private readonly usersService: UsersService,
  ) {
    this.stripe = new Stripe(this.config.get<string>('stripe.secretKey'), {
      apiVersion: '2026-03-25.dahlia',
      typescript: true,
    });
  }

  // ── Step 1: Create a Stripe PaymentIntent ────────────────────────────────
  async createPaymentIntent(
    eventId: string,
    userId: string,
  ): Promise<{ clientSecret: string; amount: number; currency: string }> {
    const event = this.findEvent(eventId);
    if (!event) throw new NotFoundException(`Moment ${eventId} not found`);

    const user = this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const priceUsd    = TIER_PRICES_USD[event.rarityTrigger] ?? 25;
    const amountCents = priceUsd * 100;

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      metadata: {
        eventId,
        userId,
        tier: event.rarityTrigger,
        playerName: event.playerName,
        walletAddress: user.walletAddress,
      },
      description: `PSL Dynamic Moments — ${event.playerName} (${event.rarityTrigger})`,
    });

    this.logger.log(
      `PaymentIntent created: ${paymentIntent.id} for ${event.playerName} — $${priceUsd}`,
    );

    return {
      clientSecret: paymentIntent.client_secret,
      amount: priceUsd,
      currency: 'USD',
    };
  }

  // ── Step 2: Stripe webhook ────────────────────────────────────────────────
  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const webhookSecret = this.config.get<string>('stripe.webhookSecret');
    let stripeEvent: StripeTypes.Event;

    try {
      stripeEvent = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook signature failed: ${err.message}`);
    }

    if (stripeEvent.type === 'payment_intent.succeeded') {
      const intent = stripeEvent.data.object as StripeTypes.PaymentIntent;
      await this.mintAfterPayment(intent);
    }
  }

  // ── Demo confirm: skip Stripe, mint immediately ──────────────────────────
  async confirmDemoPayment(
    eventId: string,
    userId: string,
  ): Promise<{ txHash: string; tokenId: number; tier: string; animationUrl: string; thumbnailUrl: string }> {
    const event = this.findEvent(eventId);
    if (!event) throw new NotFoundException(`Moment ${eventId} not found`);

    const user = this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return this.mintNftForUser(eventId, userId, user.walletAddress, event.rarityTrigger);
  }

  // ── Internal mint after payment ──────────────────────────────────────────
  private async mintAfterPayment(intent: StripeTypes.PaymentIntent): Promise<void> {
    const { eventId, userId, walletAddress, tier } = intent.metadata;
    try {
      await this.mintNftForUser(eventId, userId, walletAddress, tier);
    } catch (err) {
      this.logger.error(`Mint failed after payment ${intent.id}: ${err.message}`);
    }
  }

  private async mintNftForUser(
    eventId: string,
    userId: string,
    toAddress: string,
    tier: string,
  ): Promise<{ txHash: string; tokenId: number; tier: string; animationUrl: string; thumbnailUrl: string }> {
    const event = this.findEvent(eventId);
    if (!event) throw new NotFoundException(`Moment ${eventId} not found`);

    const tierNum = TIER_FROM_STRING[tier];

    // Pin just the metadata JSON — video & thumbnail CIDs already on Pinata
    const ipfsUri = await this.metadataService.pinMetadata(event);

    // Use mintAtTier for LEGENDARY or mintMoment for others
    const isHighTier = tier === 'LEGENDARY' || tier === 'EPIC';
    const txFn = isHighTier
      ? this.chain.nftContract.mintAtTier(toAddress, event.playerId, ipfsUri, tierNum)
      : this.chain.nftContract.mintMoment(toAddress, event.playerId, ipfsUri, tierNum);

    try {
      this.logger.log(`[MINT] Attempting to mint for ${toAddress}, tier ${tier}`);
      const tx      = await txFn;
      this.logger.log(`[MINT] Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      this.logger.log(`[MINT] Transaction confirmed`);
      const tokenId = this.parseMintEvent(receipt);

      this.usersService.addTokenToUser(userId, tokenId);

      this.eventsGateway.broadcastMint({
        tokenId,
        playerId: event.playerId,
        playerName: event.playerName,
        tier,
        txHash: receipt.hash,
      });

      this.logger.log(`✅ Minted token #${tokenId} (${tier}) → ${toAddress} | tx: ${receipt.hash}`);

      return {
        txHash:        receipt.hash,
        tokenId,
        tier,
        animationUrl:  `https://gateway.pinata.cloud/ipfs/${event.animation_url ?? ''}`,
        thumbnailUrl:  `https://gateway.pinata.cloud/ipfs/${event.thumbnail ?? ''}`,
      };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`❌ MINT FAILED: ${errMsg}`);
      
      // Log the signer address for debugging
      this.logger.error(`Signer address: ${this.chain.signer.address}`);
      this.logger.error(`Target address: ${toAddress}`);
      this.logger.error(`NFT Contract: ${await this.chain.nftContract.getAddress()}`);
      
      // Throw instead of silently falling back to demo
      throw new Error(`Minting failed: ${errMsg}`);
    }
  }

  // ── Buyable moments list ──────────────────────────────────────────────────
  getBuyableMoments() {
    return ALL_MOMENTS.map((e) => ({
      eventId:      e.eventId,
      playerId:     e.playerId,
      playerName:   e.playerName,
      team:         e.team,
      stat:         e.stat,
      momentType:   e.momentType ?? e.stat.replace(/_/g, ' '),
      matchContext: e.matchContext,
      tier:         e.rarityTrigger,
      priceUsd:     TIER_PRICES_USD[e.rarityTrigger] ?? 25,
      name:         e.name ?? `${e.playerName} — ${e.stat}`,
      description:  e.description ?? e.matchContext,
      isDeadshot:   e.isDeadshot ?? false,
      // Full Pinata gateway URLs for the frontend
      animationUrl: `https://gateway.pinata.cloud/ipfs/${e.animation_url ?? ''}`,
      thumbnailUrl: `https://gateway.pinata.cloud/ipfs/${e.thumbnail ?? ''}`,
    }));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private findEvent(eventId: string): CricketEvent | undefined {
    return ALL_MOMENTS.find((e) => e.eventId === eventId);
  }

  private parseMintEvent(receipt: any): number {
    const iface = this.chain.nftContract.interface;
    for (const log of receipt.logs ?? []) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed?.name === 'MomentMinted') return Number(parsed.args.tokenId);
      } catch (_) {}
    }
    // Demo fallback
    return Date.now() % 100000;
  }
}