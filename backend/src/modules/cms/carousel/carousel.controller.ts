import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CarouselService } from './carousel.service';
import { CreateCarouselDto, UpdateCarouselDto } from './dto/carousel.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('CMS - Carousel')
@Controller('cms/carousel')
export class CarouselController {
  constructor(private readonly carouselService: CarouselService) {}

  @Get()
  @ApiOperation({ summary: 'Get all carousels (public)' })
  @ApiQuery({ name: 'all', required: false, description: 'Include inactive carousels' })
  findAll(@Query('all') all?: string) {
    return this.carouselService.findAll(all === 'true');
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get carousel by UUID' })
  findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.carouselService.findOne(uuid);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiOperation({ summary: 'Create carousel' })
  create(@Body() dto: CreateCarouselDto, @Request() req) {
    return this.carouselService.create(dto, req.user?.name);
  }

  @Put(':uuid')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiOperation({ summary: 'Update carousel' })
  update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: UpdateCarouselDto,
    @Request() req,
  ) {
    return this.carouselService.update(uuid, dto, req.user?.name);
  }

  @Delete(':uuid')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete carousel' })
  remove(@Param('uuid', ParseUUIDPipe) uuid: string, @Request() req) {
    return this.carouselService.remove(uuid, req.user?.name);
  }
}
