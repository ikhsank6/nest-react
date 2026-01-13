import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResendVerificationDto, ResetPasswordDto, RefreshTokenDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { LoginThrottlerGuard } from '../../common/guards/login-throttler.guard';
import { AuthThrottlerGuard } from '../../common/guards/auth-throttler.guard';

@ApiTags('1. System : Authentication')
@UseGuards(AuthThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @HttpCode(200)
  @UseGuards(LoginThrottlerGuard)
  @ApiOperation({ summary: 'User login', description: 'Login with email and password to get JWT token. Rate limited to 3 attempts per minute.' })
  @ApiResponse({
    status: 200,
    description: 'Login successful - Copy the accessToken and click "Authorize" button to use it',
    schema: {
      example: {
        success: true,
        message: 'Login berhasil',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'a1b2c3d4e5f6...',
          refreshTokenEnabled: true,
          user: {
            id: 1,
            email: 'admin@example.com',
            name: 'Administrator',
            role: { id: 1, name: 'Admin' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many login attempts. Please try again later.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token', description: 'Get a new access token using refresh token. Only works if REFRESH_TOKEN_ENABLED=true.' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      example: {
        message: 'Token refreshed successfully',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'new_refresh_token...'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Refresh token is disabled' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout', description: 'Logout user and revoke refresh token (if provided).' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Body() body: { refreshToken?: string }) {
    return this.authService.logout(body.refreshToken);
  }

  @Post('register')
  @HttpCode(200)
  @ApiOperation({ summary: 'User registration', description: 'Register a new user account (auto-assigned User role). A verification email will be sent. Rate limited to 10 attempts per minute.' })
  @ApiResponse({ status: 201, description: 'Registration successful. Verification email sent.' })
  @ApiResponse({ status: 400, description: 'Email already exists or validation error' })
  @ApiResponse({ status: 429, description: 'Too many requests. Please try again later.' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email', description: 'Verify user email address using the token sent via email' })
  @ApiQuery({ name: 'token', required: true, description: 'Verification token from email' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @HttpCode(200)
  @ApiOperation({ summary: 'Resend verification email', description: 'Resend verification email to user. Rate limited to 10 attempts per minute.' })
  @ApiResponse({ status: 200, description: 'Verification email sent (if email exists and not verified)' })
  @ApiResponse({ status: 429, description: 'Too many requests. Please try again later.' })
  async resendVerification(@Body() resendVerificationDto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(resendVerificationDto.email);
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Forgot password', description: 'Request password reset email. Rate limited to 10 attempts per minute.' })
  @ApiResponse({ status: 200, description: 'Password reset email sent (if email exists)' })
  @ApiResponse({ status: 429, description: 'Too many requests. Please try again later.' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset password', description: 'Reset password using token from email. Rate limited to 10 attempts per minute.' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @ApiResponse({ status: 429, description: 'Too many requests. Please try again later.' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user profile', description: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('revoke-all-tokens')
  @HttpCode(200)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Revoke all refresh tokens', description: 'Revoke all refresh tokens for current user (logout from all devices)' })
  @ApiResponse({ status: 200, description: 'All tokens revoked' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async revokeAllTokens(@Request() req) {
    return this.authService.revokeAllTokens(req.user.sub);
  }
}

