import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../auth/data/models/user_model.dart';
import '../../data/repositories/profile_repository.dart';

// Events
abstract class ProfileEvent extends Equatable {
  const ProfileEvent();

  @override
  List<Object?> get props => [];
}

class ProfileLoadRequested extends ProfileEvent {}

class ProfileUpdateRequested extends ProfileEvent {
  final String name;
  final String? email;

  const ProfileUpdateRequested({
    required this.name,
    this.email,
  });

  @override
  List<Object?> get props => [name, email];
}

class ProfileChangePasswordRequested extends ProfileEvent {
  final String currentPassword;
  final String newPassword;
  final String confirmPassword;

  const ProfileChangePasswordRequested({
    required this.currentPassword,
    required this.newPassword,
    required this.confirmPassword,
  });

  @override
  List<Object?> get props => [currentPassword, newPassword, confirmPassword];
}

class ProfileAvatarUploadRequested extends ProfileEvent {
  final String filePath;

  const ProfileAvatarUploadRequested({required this.filePath});

  @override
  List<Object?> get props => [filePath];
}

class ProfileAvatarDeleteRequested extends ProfileEvent {}

// States
abstract class ProfileState extends Equatable {
  const ProfileState();

  @override
  List<Object?> get props => [];
}

class ProfileInitial extends ProfileState {}

class ProfileLoading extends ProfileState {}

class ProfileLoaded extends ProfileState {
  final UserModel user;

  const ProfileLoaded({required this.user});

  @override
  List<Object?> get props => [user];
}

class ProfileUpdating extends ProfileState {
  final UserModel user;

  const ProfileUpdating({required this.user});

  @override
  List<Object?> get props => [user];
}

class ProfileUpdateSuccess extends ProfileState {
  final UserModel user;
  final String message;

  const ProfileUpdateSuccess({required this.user, required this.message});

  @override
  List<Object?> get props => [user, message];
}

class ProfileError extends ProfileState {
  final String message;
  final UserModel? user;

  const ProfileError({required this.message, this.user});

  @override
  List<Object?> get props => [message, user];
}

// BLoC
class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  final ProfileRepository _profileRepository;

  ProfileBloc({required ProfileRepository profileRepository})
      : _profileRepository = profileRepository,
        super(ProfileInitial()) {
    on<ProfileLoadRequested>(_onLoadRequested);
    on<ProfileUpdateRequested>(_onUpdateRequested);
    on<ProfileChangePasswordRequested>(_onChangePasswordRequested);
    on<ProfileAvatarUploadRequested>(_onAvatarUploadRequested);
    on<ProfileAvatarDeleteRequested>(_onAvatarDeleteRequested);
  }

  Future<void> _onLoadRequested(
    ProfileLoadRequested event,
    Emitter<ProfileState> emit,
  ) async {
    emit(ProfileLoading());
    try {
      final user = await _profileRepository.getProfile();
      emit(ProfileLoaded(user: user));
    } catch (e) {
      emit(ProfileError(message: 'Gagal memuat profile'));
    }
  }

  Future<void> _onUpdateRequested(
    ProfileUpdateRequested event,
    Emitter<ProfileState> emit,
  ) async {
    final currentUser = state is ProfileLoaded 
        ? (state as ProfileLoaded).user 
        : null;
    
    emit(ProfileUpdating(user: currentUser!));
    try {
      final user = await _profileRepository.updateProfile(
        name: event.name,
        email: event.email,
      );
      emit(ProfileUpdateSuccess(user: user, message: 'Profile berhasil diperbarui'));
    } catch (e) {
      emit(ProfileError(message: 'Gagal memperbarui profile', user: currentUser));
    }
  }

  Future<void> _onChangePasswordRequested(
    ProfileChangePasswordRequested event,
    Emitter<ProfileState> emit,
  ) async {
    final currentUser = state is ProfileLoaded 
        ? (state as ProfileLoaded).user 
        : (state is ProfileUpdateSuccess 
            ? (state as ProfileUpdateSuccess).user 
            : null);
    
    emit(ProfileUpdating(user: currentUser!));
    try {
      await _profileRepository.changePassword(
        currentPassword: event.currentPassword,
        newPassword: event.newPassword,
        confirmPassword: event.confirmPassword,
      );
      emit(ProfileUpdateSuccess(user: currentUser, message: 'Password berhasil diubah'));
    } catch (e) {
      String message = 'Gagal mengubah password';
      if (e.toString().contains('400')) {
        message = 'Password lama salah atau password baru tidak valid';
      }
      emit(ProfileError(message: message, user: currentUser));
    }
  }

  Future<void> _onAvatarUploadRequested(
    ProfileAvatarUploadRequested event,
    Emitter<ProfileState> emit,
  ) async {
    final currentUser = _getCurrentUser();
    if (currentUser == null) return;
    
    emit(ProfileUpdating(user: currentUser));
    try {
      final user = await _profileRepository.uploadAvatar(event.filePath);
      emit(ProfileUpdateSuccess(user: user, message: 'Avatar berhasil diperbarui'));
    } catch (e) {
      emit(ProfileError(message: 'Gagal upload avatar', user: currentUser));
    }
  }

  Future<void> _onAvatarDeleteRequested(
    ProfileAvatarDeleteRequested event,
    Emitter<ProfileState> emit,
  ) async {
    final currentUser = _getCurrentUser();
    if (currentUser == null) return;
    
    emit(ProfileUpdating(user: currentUser));
    try {
      await _profileRepository.deleteAvatar();
      final updatedUser = currentUser.copyWith(avatar: null);
      emit(ProfileUpdateSuccess(user: updatedUser, message: 'Avatar berhasil dihapus'));
    } catch (e) {
      emit(ProfileError(message: 'Gagal menghapus avatar', user: currentUser));
    }
  }

  UserModel? _getCurrentUser() {
    if (state is ProfileLoaded) return (state as ProfileLoaded).user;
    if (state is ProfileUpdateSuccess) return (state as ProfileUpdateSuccess).user;
    if (state is ProfileUpdating) return (state as ProfileUpdating).user;
    if (state is ProfileError) return (state as ProfileError).user;
    return null;
  }
}
