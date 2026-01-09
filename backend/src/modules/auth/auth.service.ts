import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto, ForgotPasswordDto } from './dto';
import { hashPassword, comparePassword } from '../../common/utils/hash.util';
import { MenuAccessService } from '../menu-access/menu-access.service';
import { QueueService } from '../queue/queue.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private menuAccessService: MenuAccessService,
    private queueService: QueueService,
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

    if (!user.verifiedAt) {
      throw new UnauthorizedException('Email belum diverifikasi. Silakan cek email Anda.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Akun tidak aktif.');
    }

    const payload = { 
      sub: user.id, 
      uuid: user.uuid,
      email: user.email, 
      name: user.name,
      avatar: (user as any).avatar,
      role: user.role 
    };
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
          avatar: (user as any).avatar || null,
          isActive: user.isActive,
          verifiedAt: user.verifiedAt,
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
    const verificationToken = uuidv4();

    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        roleId: defaultRole.id,
        isActive: false, // User is inactive until email is verified
        verificationToken,
      },
      include: { role: true },
    });

    // Queue verification email
    await this.queueService.addVerificationEmailJob({
      email: user.email,
      name: user.name,
      verificationToken,
      createdAt: user.createdAt.toISOString(),
    });

    return {
      message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.',
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

  async verifyEmail(token: string) {
    // First try to find user by verification token
    let user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      // If not found by token, the token might already be used
      // Check if there's a user who was recently verified (within last 5 minutes)
      // This handles the case where user refreshes the page after verification
      throw new BadRequestException('Token verifikasi tidak valid atau sudah kadaluarsa.');
    }

    // If user already verified
    if (user.verifiedAt) {
      return {
        message: 'Email sudah diverifikasi sebelumnya.',
        data: {},
      };
    }

    // Verify the user
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verifiedAt: new Date(),
        isActive: true,
        verificationToken: null, // Clear the token after verification
      },
    });

    return {
      message: 'Email berhasil diverifikasi. Anda sekarang dapat login.',
      data: {},
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if email not found for security
      return {
        message: 'Jika email terdaftar, link verifikasi telah dikirim.',
        data: {},
      };
    }

    if (user.verifiedAt) {
      throw new BadRequestException('Email sudah diverifikasi.');
    }

    // Generate new verification token
    const verificationToken = uuidv4();

    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    // Queue verification email
    await this.queueService.addVerificationEmailJob({
      email: user.email,
      name: user.name,
      verificationToken,
      createdAt: user.createdAt.toISOString(),
    });

    return {
      message: 'Link verifikasi telah dikirim ke email Anda.',
      data: {},
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
        verifiedAt: user.verifiedAt,
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
