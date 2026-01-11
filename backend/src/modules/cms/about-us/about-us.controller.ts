import { Controller, Get, Post, Put, Body, Param, UseGuards, ParseUUIDPipe, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AboutUsService } from './about-us.service';
import { CreateAboutUsDto, UpdateAboutUsDto } from './dto/about-us.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('3. CMS : About Us')
@Controller('cms/about-us')
export class AboutUsController {
    constructor(private readonly aboutUsService: AboutUsService) { }

    @Get()
    @ApiOperation({ summary: 'Get company profile (public)' })
    get() {
        return this.aboutUsService.get();
    }

    @Post()
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Admin')
    @ApiOperation({ summary: 'Create company profile' })
    create(@Body() dto: CreateAboutUsDto, @Request() req) {
        return this.aboutUsService.create(dto, req.user?.name);
    }

    @Put(':uuid')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Admin')
    @ApiOperation({ summary: 'Update company profile' })
    update(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() dto: UpdateAboutUsDto,
        @Request() req,
    ) {
        return this.aboutUsService.update(uuid, dto, req.user?.name);
    }
}
