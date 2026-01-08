import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Roles')
@ApiBearerAuth('JWT-auth')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Roles('Admin')
  @ApiOperation({ summary: 'Get all roles' })
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get(':uuid')
  @Roles('Admin')
  @ApiOperation({ summary: 'Get role by UUID' })
  @ApiParam({ name: 'uuid', description: 'Role UUID' })
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.rolesService.findOne(uuid);
  }

  @Post()
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

