import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ChainProvider } from '../common/chain.provider';
import { MetadataService } from '../metadata/metadata.service';
import { EventsGateway } from '../events/events.gateway';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [PaymentController],   // ← must be here
  providers: [PaymentService, ChainProvider, MetadataService, EventsGateway],
})
export class PaymentModule {}