import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@/services/auth.service';
import { registerSchema, type RegisterFormData } from '@/lib/validations';
import { showSuccess } from '@/lib/utils';
import { Eye, EyeOff, Mail, Lock, User, Loader2, LayoutDashboard, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter';
import { useRequestGuard } from '@/hooks/useRequestGuard';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  // Hook to prevent duplicate requests (React StrictMode causes double render)
  const { withRequestGuard } = useRequestGuard();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = form.watch('password');

  const onSubmit = withRequestGuard(async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await authService.register({ 
        name: data.name, 
        email: data.email, 
        password: data.password,
        roleId: 2 // Default role: User
      });
      setRegisteredEmail(data.email);
      setRegistrationSuccess(true);
      showSuccess('Registrasi berhasil! Silakan cek email Anda.');
    } catch (error) {
      // Error handled by axios interceptor
    } finally {
      setLoading(false);
    }
  });

  // Show success message after registration
  if (registrationSuccess) {
    return (
      <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Registrasi Berhasil!</CardTitle>
          <CardDescription className="text-base">
            Kami telah mengirim link verifikasi ke email Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-2">Email dikirim ke:</p>
            <p className="font-medium text-foreground">{registeredEmail}</p>
          </div>
          <div className="text-sm text-muted-foreground text-center space-y-2">
            <p>Silakan buka email Anda dan klik link verifikasi untuk mengaktifkan akun.</p>
            <p className="text-xs">Tidak menerima email? Periksa folder spam Anda.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/login')}
          >
            Kembali ke Login
          </Button>
          <button 
            type="button"
            onClick={() => {
              setRegistrationSuccess(false);
              form.reset();
            }}
            className="text-sm text-primary hover:underline"
          >
            Daftar dengan email lain
          </button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg transform rotate-12">
            <LayoutDashboard className="w-6 h-6 text-primary-foreground transform -rotate-12" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">Create Account</CardTitle>
        <CardDescription>
          Join us today! Enter your details to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="text"
                        placeholder="John Doe"
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </FormControl>
                  <PasswordStrengthMeter password={passwordValue} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 text-center">
        <div className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
