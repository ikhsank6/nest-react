import { ViewSheet, FieldDisplay } from '@/components/ui/form-sheet';
import { type Carousel } from '@/services/carousel.service';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { env } from '@/config/env';
import { ImagePreview } from '@/components/ui/image-preview';

interface CarouselViewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carousel: Carousel | null;
  onEdit: (carousel: Carousel) => void;
}

export function CarouselViewDrawer({ open, onOpenChange, carousel, onEdit }: CarouselViewDrawerProps) {
  if (!carousel) return null;

  const imageUrl = carousel.media ? env.API_URL + (carousel.media as any).url : carousel.image || '';

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
      <FieldDisplay 
        label="Gambar" 
        value={
          <div className="mt-2 w-full max-w-sm border bg-muted rounded-lg overflow-hidden">
            <ImagePreview
              src={imageUrl}
              alt={carousel.title}
              className="w-full aspect-video"
              imageClassName="w-full aspect-video object-cover"
            />
          </div>
        } 
      />
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
