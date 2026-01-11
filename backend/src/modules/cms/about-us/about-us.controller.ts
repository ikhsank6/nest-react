import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AboutUsService } from './about-us.service';
import { CreateAboutUsDto, UpdateAboutUsDto } from './dto/about-us.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('CMS - About Us')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
@Controller('cms/about-us')
export class AboutUsController {
    constructor(private readonly aboutUsService: AboutUsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all about us sections (public)' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'all', required: false, description: 'Include inactive sections' })
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('all') all?: string,
    ) {
        return this.aboutUsService.findAll(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 10,
            search,
            all === 'true',
        );
    }

    @Get('section/:section')
    @ApiOperation({ summary: 'Get about us by section name (public)' })
    findBySection(@Param('section') section: string) {
        return this.aboutUsService.findBySection(section);
    }

    @Get(':uuid')
    @ApiOperation({ summary: 'Get about us by UUID' })
    findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
        return this.aboutUsService.findOne(uuid);
    }

    @Post()
    @ApiOperation({ summary: 'Create about us section' })
    create(@Body() dto: CreateAboutUsDto, @Request() req) {
        return this.aboutUsService.create(dto, req.user?.name);
    }

    @Put(':uuid')
    @ApiOperation({ summary: 'Update about us section' })
    update(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() dto: UpdateAboutUsDto,
        @Request() req,
    ) {
        return this.aboutUsService.update(uuid, dto, req.user?.name);
    }

    @Delete(':uuid')
    @ApiOperation({ summary: 'Delete about us section' })
    remove(@Param('uuid', ParseUUIDPipe) uuid: string, @Request() req) {
        return this.aboutUsService.remove(uuid, req.user?.name);
    }
}
