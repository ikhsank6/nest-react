import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CarouselService } from './carousel.service';
import { CreateCarouselDto, UpdateCarouselDto, ReorderCarouselDto } from './dto/carousel.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('3. CMS : Carousel')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
@Controller('cms/carousel')
export class CarouselController {
  constructor(private readonly carouselService: CarouselService) { }

  @Get()
  @ApiOperation({ summary: 'Get all carousels' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'all', required: false, description: 'Include inactive carousels' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('all') all?: string,
  ) {
    return this.carouselService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      all === 'true',
    );
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get carousel by UUID' })
  findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.carouselService.findOne(uuid);
  }

  @Post()
  @ApiOperation({ summary: 'Create carousel' })
  create(@Body() dto: CreateCarouselDto, @Request() req) {
    return this.carouselService.create(dto, req.user?.name);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder carousels' })
  reorder(@Body() dto: ReorderCarouselDto) {
    return this.carouselService.reorder(dto);
  }

  @Put(':uuid')
  @ApiOperation({ summary: 'Update carousel' })
  update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateCarouselDto,
    @Request() req,
  ) {
    return this.carouselService.update(uuid, dto, req.user?.name);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Delete carousel' })
  remove(@Param('uuid', ParseUUIDPipe) uuid: string, @Request() req) {
    return this.carouselService.remove(uuid, req.user?.name);
  }
}
