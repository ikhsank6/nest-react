import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  StreamableFile,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join, basename } from 'path';
import { createReadStream, existsSync, statSync } from 'fs';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { ProfileService } from './profile.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto/profile.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@Request() req) {
    return this.profileService.getProfile(req.user.id);
  }

  @Get('avatar/:uuid')
  async getAvatar(
    @Param('uuid') uuid: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    // Get avatar data (path or filename) from service
    const avatarData = await this.profileService.getAvatarByUuid(uuid);
    
    // Determine the full file path. 
    // If avatarData starts with '/', treat it as relative to CWD, 
    // otherwise look in uploads/avatars.
    const filePath = avatarData.startsWith('/')
      ? join(process.cwd(), avatarData)
      : join(process.cwd(), 'uploads', 'avatars', avatarData);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Avatar tidak ditemukan');
    }

    const stats = statSync(filePath);
    const ext = extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };

    const contentType = mimeTypes[ext] || 'image/jpeg';
    const fileName = basename(filePath);

    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, X-Requested-With, Application, Origin, Authorization, APIKey, Timestamp, AccessToken',
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Pragma': 'public',
      'Content-Transfer-Encoding': 'binary',
      'Content-Type': contentType,
      'Content-Length': stats.size.toString(),
      'X-Content-Type-Options': 'nosniff',
    });

    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }

  @Post('update')
  updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.id, updateProfileDto);
  }

  @Post('change-password')
  changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.profileService.changePassword(req.user.id, changePasswordDto);
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return cb(new BadRequestException('Hanya file gambar yang diizinkan!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  updateAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan.');
    }
    // Store the full path with the /uploads/avatars/ prefix
    const avatarPath = `/uploads/avatars/${file.filename}`;
    return this.profileService.updateAvatar(req.user.id, avatarPath);
  }

  @Delete('avatar')
  deleteAvatar(@Request() req) {
    return this.profileService.deleteAvatar(req.user.id);
  }

  @Delete('avatar/:uuid')
  deleteAvatarByUuid(@Param('uuid') uuid: string) {
    return this.profileService.deleteAvatarByUuid(uuid);
  }
}
