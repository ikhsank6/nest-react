import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from './dto';
import { hashPassword, comparePassword } from '../../common/utils/hash.util';
import { MenuAccessService } from '../menu-access/menu-access.service';
import { QueueService } from '../queue/queue.service';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly refreshTokenEnabled: boolean;
  private readonly refreshTokenSecret: string;
  private readonly refreshTokenExpiresIn: string;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private menuAccessService: MenuAccessService,
    private queueService: QueueService,
  ) {
    this.refreshTokenEnabled = this.configService.get<string>('REFRESH_TOKEN_ENABLED', 'false') === 'true';
    this.refreshTokenSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET', 'refresh_secret');
    this.refreshTokenExpiresIn = this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN', '7d');
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: loginDto.email, deletedAt: null },
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

    // Generate refresh token if enabled
    let refreshToken: string | undefined;
    if (this.refreshTokenEnabled) {
      refreshToken = await this.generateRefreshToken(user.id);
    }

    return {
      message: 'Login berhasil',
      data: {
        accessToken,
        // Only include refresh token if feature is enabled
        ...(this.refreshTokenEnabled && { refreshToken }),
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

  // Generate a new refresh token and store in database
  private async generateRefreshToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = this.calculateExpiry(this.refreshTokenExpiresIn);

    // Clean up old refresh tokens for this user (keep only last 5)
    await this.cleanupOldRefreshTokens(userId);

    // Store new refresh token
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  // Calculate expiry date from duration string (e.g., '7d', '24h')
  private calculateExpiry(duration: string): Date {
    const match = duration.match(/^(\d+)([dhms])$/);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default: 7 days
    }

    const value = parseInt(match[1]);
    const unit = match[2];
    const ms = {
      'd': 24 * 60 * 60 * 1000,
      'h': 60 * 60 * 1000,
      'm': 60 * 1000,
      's': 1000,
    }[unit] || 24 * 60 * 60 * 1000;

    return new Date(Date.now() + value * ms);
  }

  // Clean up old refresh tokens (keep only last 5)
  private async cleanupOldRefreshTokens(userId: number): Promise<void> {
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (tokens.length >= 5) {
      const tokensToDelete = tokens.slice(4);
      await this.prisma.refreshToken.deleteMany({
        where: { id: { in: tokensToDelete.map(t => t.id) } },
      });
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken(refreshToken: string) {
    if (!this.refreshTokenEnabled) {
      throw new BadRequestException('Refresh token is disabled.');
    }

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { role: true } } },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    if (storedToken.revokedAt) {
      throw new UnauthorizedException('Refresh token has been revoked.');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired.');
    }

    const user = storedToken.user;
    if (!user || user.deletedAt || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive.');
    }

    // Generate new access token
    const payload = {
      sub: user.id,
      uuid: user.uuid,
      email: user.email,
      name: user.name,
      avatar: (user as any).avatar,
      role: user.role
    };
    const accessToken = this.jwtService.sign(payload);

    // Optionally rotate refresh token (for extra security)
    const newRefreshToken = await this.generateRefreshToken(user.id);

    // Revoke old refresh token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    return {
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    };
  }

  // Logout - revoke refresh token
  async logout(refreshToken?: string) {
    if (refreshToken && this.refreshTokenEnabled) {
      await this.prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revokedAt: new Date() },
      });
    }

    return {
      message: 'Logout berhasil',
      data: {},
    };
  }

  // Revoke all refresh tokens for a user
  async revokeAllTokens(userId: number) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return {
      message: 'All tokens revoked',
      data: {},
    };
  }

  async register(registerDto: RegisterDto) {
    return this.prisma.$transaction(async (prisma) => {
      const existingUser = await prisma.user.findFirst({
        where: { email: registerDto.email, deletedAt: null },
      });

      if (existingUser) {
        throw new BadRequestException('Email sudah terdaftar.');
      }

      // Get default "User" role
      const defaultRole = await prisma.role.findFirst({
        where: { name: 'User', deletedAt: null },
      });

      if (!defaultRole) {
        throw new BadRequestException('Role default tidak ditemukan. Silakan hubungi administrator.');
      }

      const hashedPassword = await hashPassword(registerDto.password);
      const verificationToken = uuidv4();

      const user = await prisma.user.create({
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
    });
  }

  async verifyEmail(token: string) {
    return this.prisma.$transaction(async (prisma) => {
      // First try to find user by verification token
      let user = await prisma.user.findFirst({
        where: { verificationToken: token, deletedAt: null },
      });

      if (!user) {
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
      await prisma.user.update({
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
    });
  }

  async resendVerificationEmail(email: string) {
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: { email, deletedAt: null },
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

      await prisma.user.update({
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
    });
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: { email: forgotPasswordDto.email, deletedAt: null },
      });

      if (!user) {
        // Return success even if email not found for security
        return {
          message: 'Jika email terdaftar, instruksi reset password telah dikirim.',
          data: {},
        };
      }

      // Generate reset password token
      const resetPasswordToken = uuidv4();
      const resetPasswordExpires = new Date();
      resetPasswordExpires.setHours(resetPasswordExpires.getHours() + 1); // 1 hour expiry

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken,
          resetPasswordExpires,
        },
      });

      // Queue reset password email
      await this.queueService.addResetPasswordEmailJob({
        email: user.email,
        name: user.name,
        resetToken: resetPasswordToken,
      });

      return {
        message: 'Instruksi reset password telah dikirim ke email.',
        data: {},
      };
    });
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: resetPasswordDto.token,
          resetPasswordExpires: {
            gt: new Date(),
          },
          deletedAt: null,
        },
      });

      if (!user) {
        throw new BadRequestException('Token reset password tidak valid atau sudah kadaluarsa.');
      }

      const hashedPassword = await hashPassword(resetPasswordDto.password);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });

      return {
        message: 'Password berhasil diupdate. Silakan login dengan password baru Anda.',
        data: {},
      };
    });
  }

  async validateUser(userId: number) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User tidak ditemukan atau tidak aktif.');
    }

    return user;
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
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
