import { ViewSheet, FieldDisplay } from '@/components/ui/form-sheet';
import { type Carousel } from '@/services/carousel.service';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface CarouselViewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carousel: Carousel | null;
  onEdit: (carousel: Carousel) => void;
}

export function CarouselViewDrawer({ open, onOpenChange, carousel, onEdit }: CarouselViewDrawerProps) {
  if (!carousel) return null;

  return (
    <ViewSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Detail Carousel"
      description="Informasi lengkap carousel."
      onEdit={() => onEdit(carousel)}
    >
      <FieldDisplay label="Judul" value={carousel.title} />
      <FieldDisplay label="Subtitle" value={carousel.subtitle || '-'} />
      <FieldDisplay label="Gambar" value={carousel.image} />
      <FieldDisplay label="Link" value={carousel.link || '-'} />
      <FieldDisplay label="Urutan" value={carousel.order} />
      <FieldDisplay
        label="Status"
        value={
          <Badge variant={carousel.isActive ? 'default' : 'secondary'}>
            {carousel.isActive ? 'Aktif' : 'Nonaktif'}
          </Badge>
        }
      />
      <FieldDisplay label="Dibuat Pada" value={formatDate(carousel.createdAt)} />
      <FieldDisplay label="Dibuat Oleh" value={carousel.createdBy || '-'} />
    </ViewSheet>
  );
}
