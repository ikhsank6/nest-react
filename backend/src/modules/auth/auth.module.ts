import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MenuAccessModule } from '../menu-access/menu-access.module';
import { QueueModule } from '../queue/queue.module';
import { LoginThrottlerGuard } from '../../common/guards/login-throttler.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secret',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '7d') as any,
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ([{
        name: 'login',
        ttl: configService.get<number>('THROTTLE_LOGIN_TTL') || 60000,
        limit: configService.get<number>('THROTTLE_LOGIN_LIMIT') || 5,
      }]),
      inject: [ConfigService],
    }),
    MenuAccessModule,
    QueueModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LoginThrottlerGuard],
  exports: [AuthService, LoginThrottlerGuard],
})
export class AuthModule { }
