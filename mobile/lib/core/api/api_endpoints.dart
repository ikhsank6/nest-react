class ApiEndpoints {
  // Base URL - Change this to your backend URL
  // For Android emulator: http://10.0.2.2:3000
  // For iOS simulator: http://localhost:3000
  // For web: http://localhost:3000
  // For real device: http://10.108.6.124:3000 (your local IP)
  static const String baseUrl = 'http://10.0.2.2:3000';
  
  // Health check
  static const String health = '/';
  
  // Auth endpoints
  static const String login = '/api/auth/login';
  static const String register = '/api/auth/register';
  static const String logout = '/api/auth/logout';
  static const String refresh = '/api/auth/refresh';
  static const String profile = '/api/auth/profile';
  static const String forgotPassword = '/api/auth/forgot-password';
  static const String resetPassword = '/api/auth/reset-password';
  static const String verifyEmail = '/api/auth/verify-email';
  static const String resendVerification = '/api/auth/resend-verification';
  static const String revokeAllTokens = '/api/auth/revoke-all-tokens';
  
  // Profile endpoints
  static const String profileGet = '/api/profile';
  static const String profileUpdate = '/api/profile/update';
  static const String profileChangePassword = '/api/profile/change-password';
  static const String profileAvatar = '/api/profile/avatar';
  
  static String profileAvatarByUuid(String uuid) => '/api/profile/avatar/$uuid';
}
