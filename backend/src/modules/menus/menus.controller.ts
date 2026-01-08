import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseUUIDPipe, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Menus')
@ApiBearerAuth('JWT-auth')
@Controller('menus')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  @Roles('Admin')
  @ApiOperation({ summary: 'Get all menus with hierarchy' })
  async findAll() {
    return this.menusService.findAll();
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

