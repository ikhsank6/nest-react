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
import { AuthThrottlerGuard } from '../../common/guards/auth-throttler.guard';

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
      useFactory: (configService: ConfigService) => ([
        {
          name: 'login',
          ttl: configService.get<number>('THROTTLE_LOGIN_TTL') || 60000,
          limit: configService.get<number>('THROTTLE_LOGIN_LIMIT') || 5,
        },
        {
          name: 'auth',
          ttl: configService.get<number>('THROTTLE_AUTH_TTL') || 60000,
          limit: configService.get<number>('THROTTLE_AUTH_LIMIT') || 10,
        },
      ]),
      inject: [ConfigService],
    }),
    MenuAccessModule,
    QueueModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LoginThrottlerGuard, AuthThrottlerGuard],
  exports: [AuthService, LoginThrottlerGuard, AuthThrottlerGuard],
})
export class AuthModule { }
