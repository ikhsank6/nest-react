import { Module } from '@nestjs/common';
import { CarouselModule } from './carousel/carousel.module';
import { NewsCategoryModule } from './news-category/news-category.module';
import { NewsModule } from './news/news.module';
import { AboutUsModule } from './about-us/about-us.module';

@Module({
    imports: [
        CarouselModule,
        NewsCategoryModule,
        NewsModule,
        AboutUsModule,
    ],
    exports: [
        CarouselModule,
        NewsCategoryModule,
        NewsModule,
        AboutUsModule,
    ],
})
export class CmsModule { }
