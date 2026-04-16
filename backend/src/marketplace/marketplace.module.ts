import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceController } from './marketplace.controller';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  providers: [MarketplaceService],
  controllers: [MarketplaceController],
  exports: [MarketplaceService],
})
export class MarketplaceModule implements OnModuleInit {
  constructor(
    private readonly marketplaceService: MarketplaceService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    const deployBlock = parseInt(
      this.config.get<string>('MARKETPLACE_DEPLOY_BLOCK') ?? '0',
      10,
    );
    if (deployBlock > 0) {
      this.marketplaceService.setDeployBlock(deployBlock);
    }
  }
}