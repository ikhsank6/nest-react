import { ViewSheet, FieldDisplay } from '@/components/ui/form-sheet';
import { type NewsCategory } from '@/services/news-category.service';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface NewsCategoryViewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: NewsCategory | null;
  onEdit: (category: NewsCategory) => void;
}

export function NewsCategoryViewDrawer({ open, onOpenChange, category, onEdit }: NewsCategoryViewDrawerProps) {
  if (!category) return null;

  return (
    <ViewSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Detail Kategori"
      description="Informasi lengkap kategori berita."
      onEdit={() => onEdit(category)}
    >
      <FieldDisplay label="Nama" value={category.name} />
      <FieldDisplay label="Slug" value={category.slug} />
      <FieldDisplay label="Deskripsi" value={category.description || '-'} />
      <FieldDisplay label="Jumlah Berita" value={category._count?.news || 0} />
      <FieldDisplay
        label="Status"
        value={
          <Badge variant={category.isActive ? 'default' : 'secondary'}>
            {category.isActive ? 'Aktif' : 'Nonaktif'}
          </Badge>
        }
      />
      <FieldDisplay label="Dibuat Pada" value={formatDate(category.createdAt)} />
      <FieldDisplay label="Dibuat Oleh" value={category.createdBy || '-'} />
    </ViewSheet>
  );
}
