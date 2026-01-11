import { useState, useEffect } from 'react';
import { useRequestGuard } from '@/hooks/useRequestGuard';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@/services/auth.service';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations';
import { showSuccess, showErrorMessage } from '@/lib/utils';
import { Lock, Eye, EyeOff, Loader2, LayoutDashboard, CheckCircle2, ArrowLeft } from 'lucide-react';
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

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const { withRequestGuard } = useRequestGuard();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = form.watch('password');

  useEffect(() => {
    if (!token) {
      showErrorMessage('Token reset password tidak ditemukan');
      navigate('/login');
    }
  }, [token, navigate]);

  const onSubmit = withRequestGuard(async (data: ResetPasswordFormData) => {
    if (!token) return;
    
    setLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      setSuccess(true);
      showSuccess('Password berhasil diupdate');
    } catch (error) {
      // Error handled by axios interceptor
    } finally {
      setLoading(false);
    }
  });

  if (success) {
    return (
      <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl text-center">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Password Updated</CardTitle>
          <CardDescription>
            Your password has been reset successfully. You can now login with your new password.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Link to="/login">
            <Button className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20">
              Login Now
            </Button>
          </Link>
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
        <CardTitle className="text-3xl font-bold tracking-tight">Reset Password</CardTitle>
        <CardDescription>
          Enter your new password below to reset your account access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-11"
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
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-11"
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
              className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link to="/login">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft size={16} />
            Back to login
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
