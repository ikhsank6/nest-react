import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../../../auth/data/models/user_model.dart';

class ProfileRepository {
  final ApiClient _apiClient;

  ProfileRepository({required ApiClient apiClient}) : _apiClient = apiClient;

  Future<UserModel> getProfile() async {
    final response = await _apiClient.get(ApiEndpoints.profileGet);
    return UserModel.fromJson(response.data['data']);
  }

  Future<UserModel> updateProfile({
    required String name,
    String? email,
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.profileUpdate,
      data: {
        'name': name,
        if (email != null) 'email': email,
      },
    );
    return UserModel.fromJson(response.data['data']);
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
    required String confirmPassword,
  }) async {
    await _apiClient.post(
      ApiEndpoints.profileChangePassword,
      data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
        'confirmPassword': confirmPassword,
      },
    );
  }

  Future<UserModel> uploadAvatar(String filePath) async {
    final response = await _apiClient.uploadFile(
      ApiEndpoints.profileAvatar,
      filePath: filePath,
      fieldName: 'avatar',
    );
    return UserModel.fromJson(response.data['data']);
  }

  Future<void> deleteAvatar() async {
    await _apiClient.delete(ApiEndpoints.profileAvatar);
  }

  String getAvatarUrl(String uuid) {
    return '${ApiEndpoints.baseUrl}${ApiEndpoints.profileAvatarByUuid(uuid)}';
  }
}
