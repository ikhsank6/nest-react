import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@/services/auth.service';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { showSuccess, showErrorMessage } from '@/lib/utils';
import { Eye, EyeOff, Mail, Lock, Loader2, LayoutDashboard, AlertCircle } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRequestGuard } from '@/hooks/useRequestGuard';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notVerified, setNotVerified] = useState(false);
  const [notVerifiedEmail, setNotVerifiedEmail] = useState('');
  const [resending, setResending] = useState(false);
  
  // Hook to prevent duplicate requests (React StrictMode causes double render)
  const { withRequestGuard } = useRequestGuard();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = withRequestGuard(async (data: LoginFormData) => {
    setLoading(true);
    setNotVerified(false);
    try {
      await authService.login(data);
      showSuccess('Login berhasil');
      navigate('/admin/dashboard');
    } catch (error: any) {
      const message = error?.response?.data?.message || '';
      if (message.includes('belum diverifikasi') || message.includes('not verified')) {
        setNotVerified(true);
        setNotVerifiedEmail(data.email);
      }
      // Other errors handled by axios interceptor
    } finally {
      setLoading(false);
    }
  });

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await authService.resendVerification(notVerifiedEmail);
      showSuccess('Link verifikasi telah dikirim ke email Anda');
      setNotVerified(false);
    } catch (error) {
      showErrorMessage('Gagal mengirim ulang email verifikasi');
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg transform rotate-12">
            <LayoutDashboard className="w-6 h-6 text-primary-foreground transform -rotate-12" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
        <CardDescription>
          Enter your email to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {notVerified && (
          <Alert variant="destructive" className="bg-amber-500/10 border-amber-500/50 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-2">
              <span>Email Anda belum diverifikasi. Silakan cek email untuk link verifikasi.</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                disabled={resending}
                className="w-fit text-amber-600 border-amber-500/50 hover:bg-amber-500/10"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Mengirim...
                  </>
                ) : (
                  'Kirim ulang email verifikasi'
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        placeholder="admin@example.com"
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
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      to="/auth/forgot-password"
                      className="text-xs text-primary hover:underline underline-offset-4"
                    >
                      Forgot password?
                    </Link>
                  </div>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 text-center">
        <div className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-primary font-medium hover:underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
