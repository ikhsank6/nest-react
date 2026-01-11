import { useEffect, useState } from 'react';
import { useRequestGuard } from '@/hooks/useRequestGuard';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ModeToggle } from '@/components/mode-toggle';

type VerificationStatus = 'loading' | 'success' | 'error' | 'no-token';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  // Hook to prevent duplicate API requests
  const { withRequestGuard } = useRequestGuard();

  const token = searchParams.get('token');

  useEffect(() => {
    // If no token, show error immediately
    if (!token) {
      setStatus('no-token');
      setMessage('Token verifikasi tidak ditemukan.');
      return;
    }

    // Call verification API once
    handleVerify(token);
  }, [token]);

  const handleVerify = withRequestGuard(async (verificationToken: string) => {
    try {
      setStatus('loading');
      const response = await authService.verifyEmail(verificationToken);
      // API success - show success status
      setStatus('success');
      setMessage(response?.message || 'Email berhasil diverifikasi!');
    } catch (error: any) {
      // API error - show error status
      const errorMessage = error?.response?.data?.meta?.message 
        || error?.response?.data?.message 
        || 'Gagal memverifikasi email. Token mungkin tidak valid atau sudah kadaluarsa.';
      setStatus('error');
      setMessage(errorMessage);
    }
  });

  const handleResend = async () => {
    if (!resendEmail) return;
    
    setResending(true);
    try {
      await authService.resendVerification(resendEmail);
      setResendSuccess(true);
    } catch (error: any) {
      // Still show success for security
      setResendSuccess(true);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-background overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="verify-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#verify-grid)" />
        </svg>
      </div>

      <div className="absolute top-6 right-6 z-20">
        <ModeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              {status === 'loading' && (
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              )}
              {status === 'success' && (
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              )}
              {(status === 'error' || status === 'no-token') && (
                <div className="w-12 h-12 bg-destructive/20 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
              )}
            </div>
            
            <CardTitle className="text-3xl font-bold tracking-tight">
              {status === 'loading' && 'Memverifikasi Email'}
              {status === 'success' && 'Email Terverifikasi!'}
              {(status === 'error' || status === 'no-token') && 'Verifikasi Gagal'}
            </CardTitle>
            
            <CardDescription>
              {status === 'loading' && 'Mohon tunggu, sedang memproses verifikasi...'}
              {status === 'success' && message}
              {(status === 'error' || status === 'no-token') && message}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {status === 'success' && (
              <Button 
                variant="secondary"
                className="w-full h-12 text-base font-semibold bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
                onClick={() => navigate('/login')}
              >
                Lanjut ke Login
              </Button>
            )}

            {(status === 'error' || status === 'no-token') && !resendSuccess && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Tidak menerima email atau link sudah kadaluarsa? Masukkan email Anda untuk mengirim ulang.
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Email Anda"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    onClick={handleResend}
                    disabled={resending || !resendEmail}
                    className="shrink-0"
                  >
                    {resending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Kirim'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {resendSuccess && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Jika email terdaftar, link verifikasi baru telah dikirim.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4 text-center">
            <div className="text-sm text-muted-foreground">
              <Link to="/login" className="text-primary font-medium hover:underline underline-offset-4">
                Kembali ke halaman login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
