import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { CreateNewsDto, UpdateNewsDto } from './dto/news.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('CMS - News')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
@Controller('cms/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) { }

  @Get()
  @ApiOperation({ summary: 'Get all news' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false, description: 'Category slug' })
  @ApiQuery({ name: 'all', required: false, description: 'Include unpublished news' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('all') all?: string,
  ) {
    return this.newsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      category,
      all !== 'true',
    );
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get news by slug (increments view count)' })
  findBySlug(@Param('slug') slug: string) {
    return this.newsService.findBySlug(slug);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get news by UUID' })
  findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.newsService.findOne(uuid);
  }

  @Post()
  @ApiOperation({ summary: 'Create news' })
  create(@Body() dto: CreateNewsDto, @Request() req) {
    return this.newsService.create(dto, req.user?.name);
  }

  @Put(':uuid')
  @ApiOperation({ summary: 'Update news' })
  update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateNewsDto,
    @Request() req,
  ) {
    return this.newsService.update(uuid, dto, req.user?.name);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Delete news' })
  remove(@Param('uuid', ParseUUIDPipe) uuid: string, @Request() req) {
    return this.newsService.remove(uuid, req.user?.name);
  }
}
