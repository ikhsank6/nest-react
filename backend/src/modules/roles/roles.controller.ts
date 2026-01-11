import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('2. Master Data : Roles')
@ApiBearerAuth('JWT-auth')
@Controller('master-data/roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Get()
  @Roles('Admin')
  @ApiOperation({ summary: 'Get all roles with pagination' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.rolesService.findAll(query.page, query.limit, query.search);
  }

  @Get(':uuid')
  @Roles('Admin')
  @ApiOperation({ summary: 'Get role by UUID' })
  @ApiParam({ name: 'uuid', description: 'Role UUID' })
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.rolesService.findOne(uuid);
  }

  @Post()
  @HttpCode(200)
  @Roles('Admin')
  @ApiOperation({ summary: 'Create new role' })
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Put(':uuid')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update role by UUID' })
  @ApiParam({ name: 'uuid', description: 'Role UUID' })
  async update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(uuid, updateRoleDto);
  }

  @Delete(':uuid')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete role by UUID (soft delete)' })
  @ApiParam({ name: 'uuid', description: 'Role UUID' })
  async remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.rolesService.remove(uuid);
  }
}

