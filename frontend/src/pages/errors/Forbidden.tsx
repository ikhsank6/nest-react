import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="w-10 h-10 text-destructive" />
        </div>

        {/* Error Code */}
        <div className="space-y-2">
          <h1 className="text-7xl font-bold text-foreground tracking-tight">403</h1>
          <h2 className="text-2xl font-semibold text-foreground">Akses Ditolak</h2>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-lg">
          Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. 
          Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
          <Button asChild className="gap-2">
            <Link to="/dashboard">
              <Home className="w-4 h-4" />
              Ke Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
