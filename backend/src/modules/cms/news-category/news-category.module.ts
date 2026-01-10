import { Module } from '@nestjs/common';
import { NewsCategoryController } from './news-category.controller';
import { NewsCategoryService } from './news-category.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NewsCategoryController],
  providers: [NewsCategoryService],
  exports: [NewsCategoryService],
})
export class NewsCategoryModule {}
