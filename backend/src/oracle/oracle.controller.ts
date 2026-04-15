import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { OracleService } from './oracle.service';
import { AdminGuard } from '../auth/admin.guard';
import { PaymentService } from '../payment/payment.service';

class MintAtTierDto {
  toAddress: string;
  playerId: string;
  tier: string;
  eventId: string;
}

class RegisterTokenDto {
  playerId: string;
  tokenId: number;
}

class ScoreDto {
  recentMatches: { formPoints: number }[];
  milestones: { type: string; points: number }[];
  tradeVolume: number;
  maxTradeVolume: number;
  mintRarity: number;
}

@Controller('oracle')
export class OracleController {
  constructor(
    private readonly oracleService: OracleService,
    private readonly paymentService: PaymentService,
  ) {}

  // POST /oracle/trigger/:eventId
  @Post('trigger/:eventId')
  @UseGuards(AdminGuard)
  @HttpCode(200)
  async triggerUpgrade(@Param('eventId') eventId: string) {
    return this.oracleService.triggerUpgrade(eventId);
  }

  // POST /oracle/mint-at-tier
  @Post('mint-at-tier')
  @UseGuards(AdminGuard)
  async mintAtTier(@Body() dto: MintAtTierDto) {
    return this.oracleService.mintAtTier(
      dto.toAddress,
      dto.playerId,
      dto.tier,
      dto.eventId,
    );
  }

  // POST /oracle/register-token
  @Post('register-token')
  @UseGuards(AdminGuard)
  async registerToken(@Body() dto: RegisterTokenDto) {
    const txHash = await this.oracleService.registerToken(dto.playerId, dto.tokenId);
    return { txHash };
  }

  // POST /oracle/score/calculate
  @Post('score/calculate')
  calculateScore(@Body() dto: ScoreDto) {
    return this.oracleService.calculateScore(dto);
  }

  // GET /oracle/events/list — returns all moments in the catalog
  @Get('events/list')
  listEvents() {
    return this.oracleService.listMockEvents();
  }

  // GET /oracle/milestones
  @Get('milestones')
  getMilestones() {
    return this.oracleService.getMilestonePoints();
  }

  // GET /oracle/moments/buyable — delegates to payment service (single source of truth)
  @Get('moments/buyable')
  getBuyableMoments() {
    return this.paymentService.getBuyableMoments();
  }
}