import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { CreateMenuDto, UpdateMenuDto, ReorderMenusDto } from './dto/menu.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('2. Master Data : Menus')
@ApiBearerAuth('JWT-auth')
@Controller('master-data/menus')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenusController {
  constructor(private readonly menusService: MenusService) { }

  @Get('akses')
  @Roles('Admin')
  @ApiOperation({ summary: 'Get all menus in nested tree format' })
  async getTree() {
    return this.menusService.getTree();
  }

  @Get()
  @Roles('Admin')
  @ApiOperation({ summary: 'Get all menus with hierarchy' })
  @ApiQuery({ name: 'search', required: false, description: 'Search query' })
  async findAll(@Query('search') search?: string) {
    return this.menusService.findAll(search);
  }

  @Get(':uuid')
  @Roles('Admin')
  @ApiOperation({ summary: 'Get menu by UUID' })
  @ApiParam({ name: 'uuid', description: 'Menu UUID' })
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.menusService.findOne(uuid);
  }

  @Post()
  @HttpCode(200)
  @Roles('Admin')
  @ApiOperation({ summary: 'Create new menu' })
  async create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto);
  }

  @Post('reorder')
  @HttpCode(200)
  @Roles('Admin')
  @ApiOperation({ summary: 'Reorder menus' })
  async reorder(@Body() reorderMenusDto: ReorderMenusDto) {
    return this.menusService.reorder(reorderMenusDto);
  }

  @Put(':uuid')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update menu by UUID' })
  @ApiParam({ name: 'uuid', description: 'Menu UUID' })
  async update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return this.menusService.update(uuid, updateMenuDto);
  }

  @Delete(':uuid')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete menu by UUID (soft delete)' })
  @ApiParam({ name: 'uuid', description: 'Menu UUID' })
  async remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.menusService.remove(uuid);
  }
}

