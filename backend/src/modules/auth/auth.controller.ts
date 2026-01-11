import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResendVerificationDto, ResetPasswordDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { LoginThrottlerGuard } from '../../common/guards/login-throttler.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @HttpCode(200)
  @UseGuards(LoginThrottlerGuard)
  @ApiOperation({ summary: 'User login', description: 'Login with email and password to get JWT token. Rate limited to 5 attempts per minute.' })
  @ApiResponse({
    status: 200,
    description: 'Login successful - Copy the accessToken and click "Authorize" button to use it',
    schema: {
      example: {
        success: true,
        message: 'Login berhasil',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
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

  @Post('register')
  @HttpCode(200)
  @ApiOperation({ summary: 'User registration', description: 'Register a new user account (auto-assigned User role). A verification email will be sent.' })
  @ApiResponse({ status: 201, description: 'Registration successful. Verification email sent.' })
  @ApiResponse({ status: 400, description: 'Email already exists or validation error' })
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
  @ApiOperation({ summary: 'Resend verification email', description: 'Resend verification email to user' })
  @ApiResponse({ status: 200, description: 'Verification email sent (if email exists and not verified)' })
  async resendVerification(@Body() resendVerificationDto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(resendVerificationDto.email);
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Forgot password', description: 'Request password reset email' })
  @ApiResponse({ status: 200, description: 'Password reset email sent (if email exists)' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset password', description: 'Reset password using token from email' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
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
}
