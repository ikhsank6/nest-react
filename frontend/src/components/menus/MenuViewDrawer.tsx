import { ViewSheet, FieldDisplay } from '@/components/ui/form-sheet';
import { type Menu } from '@/services/menu.service';
import { formatDate } from '@/lib/utils';

interface MenuViewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menu: Menu | null;
  onEdit: (menu: Menu) => void;
}

export function MenuViewDrawer({ open, onOpenChange, menu, onEdit }: MenuViewDrawerProps) {
  if (!menu) return null;

  return (
    <ViewSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Detail Menu"
      description="Informasi detail menu."
      onEdit={() => onEdit(menu)}
    >
      <FieldDisplay label="Nama Menu" value={menu.name} />
      <FieldDisplay label="Path" value={menu.path || '-'} />
      <FieldDisplay label="Icon" value={menu.icon || '-'} />
      <FieldDisplay label="Order" value={menu.order.toString()} />
      <FieldDisplay 
        label="Parent" 
        value={menu.parent ? menu.parent.name : '(Root)'} 
      />
      <FieldDisplay 
        label="Status" 
        value={
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${menu.isActive ? 'bg-green-500' : 'bg-muted'}`} />
            <span>{menu.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        } 
      />
      <FieldDisplay label="Dibuat Pada" value={formatDate(menu.createdAt)} />
      <FieldDisplay label="Dibuat Oleh" value={menu.createdBy || '-'} />
      <FieldDisplay label="Terakhir Update" value={formatDate(menu.updatedAt)} />
      <FieldDisplay label="Update Oleh" value={menu.updatedBy || '-'} />
    </ViewSheet>
  );
}
