import { ViewSheet, FieldDisplay } from '@/components/ui/form-sheet';
import { type Role } from '@/services/role.service';

interface RoleViewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  onEdit: (role: Role) => void;
}

export function RoleViewDrawer({ open, onOpenChange, role, onEdit }: RoleViewDrawerProps) {
  if (!role) return null;

  return (
    <ViewSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Detail Role"
      description="Informasi detail role."
      onEdit={() => onEdit(role)}
    >
      <FieldDisplay label="Nama Role" value={role.name} />
      <FieldDisplay label="Deskripsi" value={role.description || '-'} />
      <FieldDisplay label="Dibuat Pada" value={new Date(role.createdAt).toLocaleString()} />
      <FieldDisplay label="Terakhir Update" value={new Date(role.updatedAt).toLocaleString()} />
    </ViewSheet>
  );
}
