import { Calendar, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AuditInfoProps {
  createdAt: string;
  createdBy?: string | null;
}

export function AuditInfo({ createdAt, createdBy }: AuditInfoProps) {
  return (
    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
        <Calendar className="h-3 w-3 shrink-0" />
        <span className="whitespace-nowrap">{formatDate(createdAt)}</span>
      </div>
      {createdBy && (
        <div className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
          <User className="h-3 w-3 shrink-0" />
          <span className="truncate max-w-[120px]" title={createdBy}>
            {createdBy}
          </span>
        </div>
      )}
    </div>
  );
}
