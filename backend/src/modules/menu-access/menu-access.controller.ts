import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseUUIDPipe, Request, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MenuAccessService } from './menu-access.service';
import { CreateMenuAccessDto, UpdateMenuAccessDto, BulkMenuAccessDto } from './dto/menu-access.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('2. Master Data : Menu Access')
@ApiBearerAuth('JWT-auth')
@Controller('master-data/menu-access')
@UseGuards(JwtAuthGuard)
export class MenuAccessController {
  constructor(private readonly menuAccessService: MenuAccessService) { }

  @Get('my-menus')
  async getMyMenus(@Request() req) {
    return this.menuAccessService.getAccessibleMenus(req.user.role.id);
  }

  @Get('role/:roleUuid')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  async findByRole(@Param('roleUuid', ParseUUIDPipe) roleUuid: string) {
    return this.menuAccessService.findByRole(roleUuid);
  }

  @Post()
  @HttpCode(200)
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

  @Put(':uuid')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  async update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() updateMenuAccessDto: UpdateMenuAccessDto,
  ) {
    return this.menuAccessService.update(uuid, updateMenuAccessDto);
  }

  @Delete(':uuid')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  async remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.menuAccessService.remove(uuid);
  }
}
