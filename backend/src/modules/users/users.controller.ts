import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, HttpCode, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('2. Master Data : Users')
@ApiBearerAuth('JWT-auth')
@Controller('master-data/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @Roles('Admin')
  @ApiOperation({ summary: 'Get all users with pagination' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll(
      query.page,
      query.limit,
      query.search,
      query.is_active,
    );
  }

  @Get(':uuid')
  @Roles('Admin')
  @ApiOperation({ summary: 'Get user by UUID' })
  @ApiParam({ name: 'uuid', description: 'User UUID' })
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.usersService.findOne(uuid);
  }

  @Post()
  @HttpCode(200)
  @Roles('Admin')
  @ApiOperation({ summary: 'Create new user' })
  async create(@Body() createUserDto: CreateUserDto, @Request() req: any) {
    const currentUserId = req.user?.id;
    return this.usersService.create(createUserDto, currentUserId);
  }

  @Put(':uuid')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update user by UUID' })
  @ApiParam({ name: 'uuid', description: 'User UUID' })
  async update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(uuid, updateUserDto);
  }

  @Delete(':uuid')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete user by UUID (soft delete)' })
  @ApiParam({ name: 'uuid', description: 'User UUID' })
  async remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.usersService.remove(uuid);
  }

  @Post(':uuid/resend-verification')
  @HttpCode(200)
  @Roles('Admin')
  @ApiOperation({ summary: 'Resend verification email to user' })
  @ApiParam({ name: 'uuid', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 400, description: 'User already verified' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resendVerification(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.usersService.resendVerificationEmail(uuid);
  }
}

