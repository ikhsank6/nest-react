import { Module } from '@nestjs/common';
import { MenuAccessController } from './menu-access.controller';
import { MenuAccessService } from './menu-access.service';

@Module({
  controllers: [MenuAccessController],
  providers: [MenuAccessService],
  exports: [MenuAccessService],
})
export class MenuAccessModule {}
