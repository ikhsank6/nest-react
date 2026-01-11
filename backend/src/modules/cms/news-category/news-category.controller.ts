import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NewsCategoryService } from './news-category.service';
import { CreateNewsCategoryDto, UpdateNewsCategoryDto } from './dto/news-category.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('CMS - News Category')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
@Controller('cms/news-category')
export class NewsCategoryController {
  constructor(private readonly newsCategoryService: NewsCategoryService) { }

  @Get()
  @ApiOperation({ summary: 'Get all news categories' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'all', required: false, description: 'Include inactive categories' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('all') all?: string,
  ) {
    return this.newsCategoryService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      all === 'true',
    );
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get news category by UUID' })
  findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.newsCategoryService.findOne(uuid);
  }

  @Post()
  @ApiOperation({ summary: 'Create news category' })
  create(@Body() dto: CreateNewsCategoryDto, @Request() req) {
    return this.newsCategoryService.create(dto, req.user?.name);
  }

  @Put(':uuid')
  @ApiOperation({ summary: 'Update news category' })
  update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateNewsCategoryDto,
    @Request() req,
  ) {
    return this.newsCategoryService.update(uuid, dto, req.user?.name);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Delete news category' })
  remove(@Param('uuid', ParseUUIDPipe) uuid: string, @Request() req) {
    return this.newsCategoryService.remove(uuid, req.user?.name);
  }
}
