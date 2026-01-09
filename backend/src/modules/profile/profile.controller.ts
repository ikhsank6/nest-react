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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { createReadStream, existsSync } from 'fs';
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
    @Res() res: Response,
  ): Promise<void> {
    // Get avatar data (path or filename) from service
    const avatarData = await this.profileService.getAvatarByUuid(uuid);

    // Support both old filename-only format and new full-path format
    const filePath = avatarData.startsWith('/')
      ? join(process.cwd(), avatarData)
      : join(process.cwd(), 'uploads', 'avatars', avatarData);
    
    if (!existsSync(filePath)) {
      throw new NotFoundException('Avatar tidak ditemukan');
    }

    // Set Cache-Control to no-cache temporarily to fix disk cache issues
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    });

    // Send file directly using Express response object
    // This bypasses NestJS global interceptors that might corrupt the binary data
    res.sendFile(filePath);
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
}
