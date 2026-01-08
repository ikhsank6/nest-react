import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto, ForgotPasswordDto } from './dto';
import { hashPassword, comparePassword } from '../../common/utils/hash.util';
import { MenuAccessService } from '../menu-access/menu-access.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private menuAccessService: MenuAccessService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah.');
    }

    const isPasswordValid = await comparePassword(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Akun tidak aktif.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    // Get accessible menus for user's role
    let menus: any[] = [];
    if (user.roleId) {
      const menusResult = await this.menuAccessService.getAccessibleMenus(user.roleId);
      menus = menusResult.data;
    }

    return {
      message: 'Login berhasil',
      data: {
        accessToken,
        user: {
          uuid: user.uuid,
          email: user.email,
          name: user.name,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          role: user.role ? {
            uuid: user.role.uuid,
            name: user.role.name,
          } : null,
        },
        menus,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar.');
    }

    // Get default "User" role
    const defaultRole = await this.prisma.role.findFirst({
      where: { name: 'User' },
    });

    if (!defaultRole) {
      throw new BadRequestException('Role default tidak ditemukan. Silakan hubungi administrator.');
    }

    const hashedPassword = await hashPassword(registerDto.password);

    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        roleId: defaultRole.id,
      },
      include: { role: true },
    });

    return {
      message: 'Registrasi berhasil',
      data: {
        user: {
          uuid: user.uuid,
          email: user.email,
          name: user.name,
          role: user.role ? {
            uuid: user.role.uuid,
            name: user.role.name,
          } : null,
        },
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Return success even if email not found for security
      return {
        message: 'Jika email terdaftar, instruksi reset password telah dikirim.',
        data: {},
      };
    }

    // TODO: Implement email sending logic here
    // For now, just return success message

    return {
      message: 'Instruksi reset password telah dikirim ke email.',
      data: {},
    };
  }

  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User tidak ditemukan atau tidak aktif.');
    }

    return user;
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan.');
    }

    return {
      message: 'Success',
      data: {
        uuid: user.uuid,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        role: user.role ? {
          uuid: user.role.uuid,
          name: user.role.name,
        } : null,
      },
    };
  }
}

