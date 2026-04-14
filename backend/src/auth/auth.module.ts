import { Module } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UsersModule, 
    JwtModule.register({ 
      secret: process.env.JWT_SECRET || 'fallback_secret', // Ideally use ConfigModule here
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AdminGuard, AuthService],
  exports: [AdminGuard, AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
