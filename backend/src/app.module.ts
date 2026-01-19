import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from './logger/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { MenusModule } from './modules/menus/menus.module';
import { MenuAccessModule } from './modules/menu-access/menu-access.module';
import { EmailModule } from './modules/email/email.module';
import { QueueModule } from './modules/queue/queue.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ProfileModule } from './modules/profile/profile.module';
import { CmsModule } from './modules/cms/cms.module';
import { WebsiteModule } from './modules/website/website.module';
import { UploadModule } from './upload/upload.module';
import { MediaModule } from './media/media.module';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    LoggerModule,
    EmailModule,
    QueueModule,
    AuthModule,
    UsersModule,
    RolesModule,
    MenusModule,
    MenuAccessModule,
    NotificationsModule,
    ProfileModule,
    CmsModule,
    WebsiteModule,
    UploadModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
  ],
})
export class AppModule { }

