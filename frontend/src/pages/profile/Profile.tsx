import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRequestGuard } from '@/hooks/useRequestGuard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { showSuccess, showError, showErrorMessage } from '@/lib/utils';
import { Camera, Lock, Mail, User as UserIcon, Loader2, CheckCircle2, X, Eye, EyeOff } from 'lucide-react';
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter';
import { profileService } from '@/services/profile.service';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const profileSchema = z.object({
  name: z.string().min(2, 'Nama harus minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini harus diisi'),
  newPassword: z.string().min(12, "Password minimal 12 karakter")
    .max(50, "Password maksimal 50 karakter")
    .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
    .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung minimal 1 angka")
    .regex(/[^A-Za-z0-9]/, "Password harus mengandung minimal 1 karakter spesial"),
  confirmPassword: z.string().min(1, 'Konfirmasi password harus diisi'),
}).refine((data: any) => data.newPassword === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
});

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const updateUser = (updatedUser: any) => {
    useAuthStore.setState((state) => ({
      user: { ...state.user, ...updatedUser }
    }));
  };
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { withRequestGuard } = useRequestGuard();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });

  const newPasswordValue = passwordForm.watch('newPassword');

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, profileForm.reset]);

  const onUpdateProfile = withRequestGuard(async (data: z.infer<typeof profileSchema>) => {
    try {
      setIsLoading(true);
      const updatedUser = await profileService.updateProfile(data);
      updateUser(updatedUser);
      showSuccess('Profil berhasil diperbarui');
    } catch (error: any) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  });

  const onChangePassword = withRequestGuard(async (data: z.infer<typeof passwordSchema>) => {
    try {
      setIsLoading(true);
      await profileService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      showSuccess('Password berhasil diubah');
      passwordForm.reset();
    } catch (error: any) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = withRequestGuard(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showErrorMessage('Ukuran file maksimal 2MB');
      return;
    }

    try {
      setIsAvatarLoading(true);
      const updatedUser = await profileService.updateAvatar(file);
      updateUser(updatedUser);
      showSuccess('Foto profil berhasil diubah');
    } catch (error: any) {
      showError(error);
    } finally {
      setIsAvatarLoading(false);
    }
  });

  const handleRemoveAvatar = withRequestGuard(async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering file input
    if (!user?.avatar) return;

    try {
      setIsAvatarLoading(true);
      const updatedUser = await profileService.deleteAvatar(user.uuid);
      updateUser(updatedUser);
      setAvatarBlobUrl(undefined); // Clear blob url
      showSuccess('Foto profil berhasil dihapus');
    } catch (error: any) {
      showError(error);
    } finally {
      setIsAvatarLoading(false);
    }
  });

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  // Avatar blob URL state
  const [avatarBlobUrl, setAvatarBlobUrl] = useState<string | undefined>(undefined);
  
  // Fetch avatar with auth token using profileService
  const fetchAvatarCallback = useCallback(async () => {
    if (!user?.avatar || !user?.uuid) {
      setAvatarBlobUrl(undefined);
      return null;
    }

    const blob = await profileService.getAvatarBlob(user.uuid);
    return blob;
  }, [user?.avatar, user?.uuid]);

  useEffect(() => {
    let isMounted = true;
    let currentBlobUrl: string | null = null;
    
    const fetchAvatar = async () => {
      try {
        const blob = await fetchAvatarCallback();
        if (isMounted && blob && blob instanceof Blob) {
          const blobUrl = URL.createObjectURL(blob);
          currentBlobUrl = blobUrl;
          setAvatarBlobUrl(blobUrl);
        }
      } catch {
        // Ignore errors
      }
    };

    fetchAvatar();

    // Cleanup blob URL on unmount or when dependencies change
    return () => {
      isMounted = false;
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [fetchAvatarCallback]);

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Pengaturan Profil</CardTitle>
          <CardDescription>
            Kelola informasi akun dan keamanan Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-8 md:grid-cols-[250px_1fr]">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <Avatar className="h-48 w-48 cursor-pointer border-4 border-background shadow-xl transition-all group-hover:opacity-90" onClick={handleAvatarClick}>
                  <AvatarImage src={avatarBlobUrl} alt={user?.name} className="object-cover" />
                  <AvatarFallback className="text-4xl font-bold bg-linear-to-br from-primary/80 to-primary text-primary-foreground">
                    {getInitials(user?.name || '')}
                  </AvatarFallback>
                  {isAvatarLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </Avatar>
                {user?.avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute top-0 right-0 z-20 rounded-full bg-destructive p-2 text-destructive-foreground shadow-sm hover:bg-destructive/90 transition-colors"
                    title="Hapus foto profil"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.role?.name}</p>
              </div>
            </div>

            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="general">Informasi Umum</TabsTrigger>
                <TabsTrigger value="security">Keamanan</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Profil</h3>
                    <p className="text-sm text-muted-foreground">
                      Perbarui informasi nama dan alamat email Anda.
                    </p>
                  </div>
                  <Separator />
                </div>
                <form id="profile-form" onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="name" className="pl-10" {...profileForm.register('name')} />
                      </div>
                      {profileForm.formState.errors.name && (
                        <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="email" className="pl-10" {...profileForm.register('email')} />
                      </div>
                      {profileForm.formState.errors.email && (
                        <p className="text-xs text-destructive">{profileForm.formState.errors.email.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-500" />
                      Terakhir diperbarui: {new Date(user?.updatedAt || '').toLocaleDateString('id-ID')}
                    </p>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Simpan Perubahan
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Password</h3>
                    <p className="text-sm text-muted-foreground">
                      Ganti password Anda secara berkala untuk menjaga keamanan akun.
                    </p>
                  </div>
                  <Separator />
                </div>
                <form id="password-form" onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Password Saat Ini</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          className="pl-10 pr-10"
                          {...passwordForm.register('currentPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Password Baru</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          className="pl-10 pr-10"
                          {...passwordForm.register('newPassword')}
                        />
                         <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <PasswordStrengthMeter password={newPasswordValue || ''} />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="pl-10 pr-10"
                          {...passwordForm.register('confirmPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Ganti Password
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
