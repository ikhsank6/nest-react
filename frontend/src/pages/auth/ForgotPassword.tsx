import { useState } from 'react';
import { useRequestGuard } from '@/hooks/useRequestGuard';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@/services/auth.service';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations';
import { showSuccess } from '@/lib/utils';
import { Mail, ArrowLeft, Loader2, LayoutDashboard, CheckCircle2 } from 'lucide-react';
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

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const { withRequestGuard } = useRequestGuard();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = withRequestGuard(async (data: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setSent(true);
      showSuccess('Instruksi reset password telah dikirim');
    } catch (error) {
      // Error handled by axios interceptor
    } finally {
      setLoading(false);
    }
  });

  if (sent) {
    return (
      <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl text-center">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Check your email</CardTitle>
          <CardDescription>
            We've sent password reset instructions to <span className="font-semibold text-foreground">{submittedEmail}</span>
          </CardDescription>
        </CardHeader>
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

  return (
    <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg transform rotate-12">
            <LayoutDashboard className="w-6 h-6 text-primary-foreground transform -rotate-12" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">Forgot Password?</CardTitle>
        <CardDescription>
          Enter your email and we'll send you reset instructions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Send Reset Instructions'
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
