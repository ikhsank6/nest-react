import { ViewSheet, FieldDisplay } from '@/components/ui/form-sheet';
import { type AboutUs } from '@/services/about-us.service';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AboutUsViewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: AboutUs | null;
  onEdit: (section: AboutUs) => void;
}

export function AboutUsViewDrawer({ open, onOpenChange, section, onEdit }: AboutUsViewDrawerProps) {
  if (!section) return null;

  return (
    <ViewSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Detail Section"
      description="Informasi lengkap section About Us."
      onEdit={() => onEdit(section)}
    >
      <FieldDisplay label="Section" value={section.section} />
      <FieldDisplay label="Judul" value={section.title} />
      <FieldDisplay label="Konten" value={section.content} />
      <FieldDisplay label="Gambar" value={section.image || '-'} />
      <FieldDisplay label="Urutan" value={section.order} />
      <FieldDisplay
        label="Status"
        value={
          <Badge variant={section.isActive ? 'default' : 'secondary'}>
            {section.isActive ? 'Aktif' : 'Nonaktif'}
          </Badge>
        }
      />
      <FieldDisplay label="Dibuat Pada" value={formatDate(section.createdAt)} />
      <FieldDisplay label="Dibuat Oleh" value={section.createdBy || '-'} />
    </ViewSheet>
  );
}
