import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MenuAccessService } from './menu-access.service';
import { CreateMenuAccessDto, UpdateMenuAccessDto, BulkMenuAccessDto } from './dto/menu-access.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Menu Access')
@ApiBearerAuth('JWT-auth')
@Controller('menu-access')
@UseGuards(JwtAuthGuard)
export class MenuAccessController {
  constructor(private readonly menuAccessService: MenuAccessService) {}

  @Get('my-menus')
  async getMyMenus(@Request() req) {
    return this.menuAccessService.getAccessibleMenus(req.user.role.id);
  }

  @Get('role/:roleId')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  async findByRole(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.menuAccessService.findByRole(roleId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('Admin')
  async create(@Body() createMenuAccessDto: CreateMenuAccessDto) {
    return this.menuAccessService.create(createMenuAccessDto);
  }

  @Put('bulk')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  async bulkUpdate(@Body() bulkDto: BulkMenuAccessDto) {
    return this.menuAccessService.bulkUpdate(bulkDto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuAccessDto: UpdateMenuAccessDto,
  ) {
    return this.menuAccessService.update(id, updateMenuAccessDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuAccessService.remove(id);
  }
}
