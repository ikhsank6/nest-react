import { ViewSheet, FieldDisplay } from '@/components/ui/form-sheet';
import { type User } from '@/services/user.service';
import { formatDate } from '@/lib/utils';

interface UserViewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onEdit: (user: User) => void;
}

export function UserViewDrawer({ open, onOpenChange, user, onEdit }: UserViewDrawerProps) {
  if (!user) return null;

  return (
    <ViewSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Detail User"
      description="Informasi detail user."
      onEdit={() => onEdit(user)}
    >
      <FieldDisplay label="Nama" value={user.name} />
      <FieldDisplay label="Email" value={user.email} />
      <FieldDisplay label="Role" value={user.role?.name} />
      <FieldDisplay 
        label="Status" 
        value={
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-muted'}`} />
            <span>{user.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        } 
      />
      <FieldDisplay label="Dibuat Pada" value={formatDate(user.createdAt)} />
      <FieldDisplay label="Terakhir Update" value={formatDate(user.updatedAt)} />
    </ViewSheet>
  );
}
