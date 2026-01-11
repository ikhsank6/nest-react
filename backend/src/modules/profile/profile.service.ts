import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto/profile.dto';
import { hashPassword, comparePassword } from '../../common/utils/hash.util';
import { UserResource } from '../users/resources/user.resource';
import { join } from 'path';
import { unlinkSync, existsSync } from 'fs';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) { }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan.');
    }

    return { message: 'Success', data: new UserResource(user) };
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
      if (!user) throw new NotFoundException('User tidak ditemukan.');

      if (updateProfileDto.email && updateProfileDto.email !== user.email) {
        const existingEmail = await prisma.user.findFirst({
          where: { email: updateProfileDto.email, deletedAt: null },
        });
        if (existingEmail) throw new BadRequestException('Email sudah digunakan.');
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateProfileDto,
        include: { role: true },
      });

      return { message: 'Profil berhasil diperbarui.', data: new UserResource(updatedUser) };
    });
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
      if (!user) throw new NotFoundException('User tidak ditemukan.');

      const isPasswordValid = await comparePassword(changePasswordDto.currentPassword, user.password);
      if (!isPasswordValid) throw new BadRequestException('Password saat ini salah.');

      const hashedPassword = await hashPassword(changePasswordDto.newPassword);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return { message: 'Password berhasil diubah.' };
    });
  }

  async updateAvatar(userId: number, avatarFilename: string) {
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
      if (!user) throw new NotFoundException('User tidak ditemukan.');

      if (user.avatar) {
        this.deleteFileIfExists(user.avatar);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarFilename } as any,
        include: { role: true },
      });

      return { message: 'Avatar berhasil diperbarui.', data: new UserResource(updatedUser) };
    });
  }

  async deleteAvatar(userId: number) {
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
      if (!user) throw new NotFoundException('User tidak ditemukan.');

      if (user.avatar) {
        this.deleteFileIfExists(user.avatar);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatar: null } as any,
        include: { role: true },
      });

      return { message: 'Avatar berhasil dihapus.', data: new UserResource(updatedUser) };
    });
  }

  async deleteAvatarByUuid(uuid: string) {
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: { uuid, deletedAt: null },
      });

      if (!user) {
        throw new NotFoundException('User tidak ditemukan.');
      }

      if (user.avatar) {
        this.deleteFileIfExists(user.avatar);
      }

      const updatedUser = await prisma.user.update({
        where: { uuid },
        data: { avatar: null } as any,
        include: { role: true },
      });

      return { message: 'Avatar berhasil dihapus.', data: new UserResource(updatedUser) };
    });
  }

  async getAvatarByUuid(uuid: string): Promise<string> {
    const user = await this.prisma.user.findFirst({
      where: { uuid, deletedAt: null },
    });

    if (!user || !(user as any).avatar) {
      throw new NotFoundException('Avatar tidak ditemukan.');
    }

    return (user as any).avatar;
  }

  private deleteFileIfExists(avatarPath: string) {
    // Determine the full file path. 
    // If avatarPath starts with '/', treat it as relative to CWD, 
    // otherwise look in uploads/avatars.
    const filePath = avatarPath.startsWith('/')
      ? join(process.cwd(), avatarPath)
      : join(process.cwd(), 'uploads', 'avatars', avatarPath);

    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath);
      } catch (error) {
        console.error(`Failed to delete file at ${filePath}:`, error);
      }
    }
  }
}
