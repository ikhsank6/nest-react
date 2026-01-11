import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    BadRequestException,
    UseGuards,
    Get,
    Param,
    Res,
    NotFoundException,
    Delete,
    Request as NestRequest,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { ApiBearerAuth, ApiConsumes, ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { existsSync } from 'fs';
import type { Response } from 'express';
import { MediaService } from '../media/media.service';

const uploadPath = './uploads/images';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
    constructor(private mediaService: MediaService) { }

    @Post('image')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: uploadPath,
                filename: (req, file, callback) => {
                    const uniqueSuffix = uuidv4();
                    const ext = extname(file.originalname);
                    callback(null, `${uniqueSuffix}${ext}`);
                },
            }),
        }),
    )
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiOperation({ summary: 'Upload an image file' })
    async uploadImage(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                ],
            }),
        )
        file: Express.Multer.File,
        @NestRequest() req,
    ) {
        if (!file) {
            throw new NotFoundException('File not received by server');
        }

        // Manual file type validation
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`);
        }

        const media = await this.mediaService.create({
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: `/uploads/images/${file.filename}`,
            createdBy: req.user?.name || req.user?.email,
        });

        return {
            uuid: media.uuid,
            filename: media.filename,
            original_name: media.originalName,
            url: `/upload/images/${media.uuid}`,
        };
    }

    @Get('images/:uuid')
    @ApiOperation({ summary: 'Get uploaded image by UUID' })
    async getImage(@Param('uuid') uuid: string, @Res() res: Response) {
        const media = await this.mediaService.findByUuid(uuid);

        if (!media) {
            throw new NotFoundException('Image not found');
        }

        const filePath = join(process.cwd(), uploadPath, media.filename);

        if (!existsSync(filePath)) {
            throw new NotFoundException('Image file not found');
        }

        return res.sendFile(filePath);
    }

    @Delete(':uuid')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete uploaded media' })
    async deleteMedia(@Param('uuid') uuid: string) {
        return this.mediaService.delete(uuid);
    }
}
