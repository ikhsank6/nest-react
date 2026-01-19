import 'dart:convert';
import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../../../../core/storage/secure_storage.dart';
import '../models/user_model.dart';

class AuthRepository {
  final ApiClient _apiClient;
  final SecureStorage _storage = SecureStorage();

  AuthRepository({required ApiClient apiClient}) : _apiClient = apiClient;

  Future<UserModel> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiEndpoints.login,
        data: {
          'email': email,
          'password': password,
        },
      );

      final data = response.data['data'];
      
      // Save tokens
      await _storage.saveTokens(
        accessToken: data['accessToken'],
        refreshToken: data['refreshToken'],
      );

      // Parse and save user
      final user = UserModel.fromJson(data['user']);
      await _storage.saveUserData(jsonEncode(user.toJson()));

      return user;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> logout() async {
    try {
      final refreshToken = await _storage.getRefreshToken();
      await _apiClient.post(
        ApiEndpoints.logout,
        data: {'refreshToken': refreshToken},
      );
    } catch (e) {
      // Ignore logout errors
    } finally {
      await _storage.clearAll();
    }
  }

  Future<UserModel?> getCurrentUser() async {
    try {
      final isAuthenticated = await _storage.isAuthenticated();
      if (!isAuthenticated) return null;

      // Try to get from storage first
      final storedUser = await _storage.getUserData();
      if (storedUser != null) {
        return UserModel.fromJson(jsonDecode(storedUser));
      }

      // Fetch from API
      final response = await _apiClient.get(ApiEndpoints.profile);
      final user = UserModel.fromJson(response.data['data']);
      await _storage.saveUserData(jsonEncode(user.toJson()));
      return user;
    } catch (e) {
      return null;
    }
  }

  Future<bool> isAuthenticated() async {
    return await _storage.isAuthenticated();
  }

  Future<void> refreshToken() async {
    final refreshToken = await _storage.getRefreshToken();
    if (refreshToken == null) throw Exception('No refresh token');

    final response = await _apiClient.post(
      ApiEndpoints.refresh,
      data: {'refreshToken': refreshToken},
    );

    final data = response.data['data'];
    await _storage.saveTokens(
      accessToken: data['accessToken'],
      refreshToken: data['refreshToken'],
    );
  }
}
