import { Controller, Get, Param, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import { WebsiteService } from './website.service';

@ApiTags('4. Public Website')
@Controller('website')
export class WebsiteController {
    constructor(private readonly websiteService: WebsiteService) { }

    @Get('home')
    @ApiOperation({ summary: 'Get homepage data (carousels, about, latest news)' })
    @ApiResponse({ status: 200, description: 'Homepage data retrieved successfully' })
    getHomePageData() {
        return this.websiteService.getHomePageData();
    }

    @Get('carousels')
    @ApiOperation({ summary: 'Get active carousels' })
    @ApiResponse({ status: 200, description: 'Active carousels retrieved successfully' })
    getCarousels() {
        return this.websiteService.getCarousels();
    }

    @Get('about-us')
    @ApiOperation({ summary: 'Get company profile / about us' })
    @ApiResponse({ status: 200, description: 'About us data retrieved successfully' })
    getAboutUs() {
        return this.websiteService.getAboutUs();
    }

    @Get('news')
    @ApiOperation({ summary: 'Get published news list with pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search keyword' })
    @ApiQuery({ name: 'category', required: false, type: String, description: 'Category slug' })
    @ApiResponse({ status: 200, description: 'News list retrieved successfully' })
    getNewsList(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('search') search?: string,
        @Query('category') category?: string,
    ) {
        return this.websiteService.getNewsList(page, limit, search, category);
    }

    @Get('news/:slug')
    @ApiOperation({ summary: 'Get news detail by slug' })
    @ApiParam({ name: 'slug', description: 'News slug' })
    @ApiResponse({ status: 200, description: 'News detail retrieved successfully' })
    @ApiResponse({ status: 404, description: 'News not found' })
    getNewsBySlug(@Param('slug') slug: string) {
        return this.websiteService.getNewsBySlug(slug);
    }

    @Get('news-categories')
    @ApiOperation({ summary: 'Get all news categories' })
    @ApiResponse({ status: 200, description: 'News categories retrieved successfully' })
    getNewsCategories() {
        return this.websiteService.getNewsCategories();
    }
}
