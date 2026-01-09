import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto/profile.dto';
import { hashPassword, comparePassword } from '../../common/utils/hash.util';
import { UserResource } from '../users/resources/user.resource';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan.');
    }

    return { message: 'Success', data: new UserResource(user) };
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan.');

    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: updateProfileDto.email },
      });
      if (existingEmail) throw new BadRequestException('Email sudah digunakan.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      include: { role: true },
    });

    return { message: 'Profil berhasil diperbarui.', data: new UserResource(updatedUser) };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan.');

    const isPasswordValid = await comparePassword(changePasswordDto.currentPassword, user.password);
    if (!isPasswordValid) throw new BadRequestException('Password saat ini salah.');

    const hashedPassword = await hashPassword(changePasswordDto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password berhasil diubah.' };
  }

  async updateAvatar(userId: number, avatarFilename: string) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarFilename } as any,
      include: { role: true },
    });

    return { message: 'Avatar berhasil diperbarui.', data: new UserResource(updatedUser) };
  }

  async getAvatarByUuid(uuid: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { uuid, deletedAt: null },
    });

    if (!user || !(user as any).avatar) {
      throw new NotFoundException('Avatar tidak ditemukan.');
    }

    return (user as any).avatar;
  }
}
