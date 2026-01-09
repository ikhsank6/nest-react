import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type VerificationStatus = 'loading' | 'success' | 'error' | 'no-token';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      setMessage('Token verifikasi tidak ditemukan.');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setStatus('loading');
      const response = await authService.verifyEmail(verificationToken);
      setStatus('success');
      setMessage(response?.message || 'Email berhasil diverifikasi!');
    } catch (error: any) {
      setStatus('error');
      setMessage(error?.response?.data?.message || 'Gagal memverifikasi email. Token mungkin tidak valid atau sudah kadaluarsa.');
    }
  };

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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <Card className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          {status === 'loading' && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Memverifikasi Email</CardTitle>
              <CardDescription className="text-gray-300">
                Mohon tunggu sebentar...
              </CardDescription>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Email Terverifikasi!</CardTitle>
              <CardDescription className="text-gray-300">
                {message}
              </CardDescription>
            </>
          )}

          {(status === 'error' || status === 'no-token') && (
            <>
              <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Verifikasi Gagal</CardTitle>
              <CardDescription className="text-gray-300">
                {message}
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'success' && (
            <Button 
              className="w-full bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={() => navigate('/login')}
            >
              Lanjut ke Login
            </Button>
          )}

          {(status === 'error' || status === 'no-token') && !resendSuccess && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400 text-center">
                Tidak menerima email atau link sudah kadaluarsa? Masukkan email Anda untuk mengirim ulang.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Email Anda"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Button 
                  onClick={handleResend}
                  disabled={resending || !resendEmail}
                  className="bg-purple-500 hover:bg-purple-600 shrink-0"
                >
                  {resending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {resendSuccess && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-sm text-gray-300">
                Jika email terdaftar, link verifikasi baru telah dikirim.
              </p>
            </div>
          )}

          <div className="text-center pt-4 border-t border-white/10">
            <Link to="/login" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              Kembali ke halaman login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
