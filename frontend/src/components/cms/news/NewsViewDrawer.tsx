import { ViewSheet, FieldDisplay } from '@/components/ui/form-sheet';
import { type News } from '@/services/news.service';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ImagePreview } from '@/components/ui/image-preview';

interface NewsViewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  news: News | null;
  onEdit: (news: News) => void;
}

export function NewsViewDrawer({ open, onOpenChange, news, onEdit }: NewsViewDrawerProps) {
  if (!news) return null;

  const imageUrl = news.image 
    ? (news.image.startsWith('http') ? news.image : `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${news.image}`)
    : '';

  return (
    <ViewSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Detail Berita"
      description="Informasi lengkap berita."
      onEdit={() => onEdit(news)}
    >
      <FieldDisplay label="Judul" value={news.title} />
      <FieldDisplay label="Slug" value={news.slug} />
      <FieldDisplay label="Kategori" value={news.category?.name} />
      <FieldDisplay label="Ringkasan" value={news.excerpt || '-'} />
      <FieldDisplay 
        label="Gambar Utama" 
        value={imageUrl ? (
          <div className="mt-2 rounded-md overflow-hidden border">
            <ImagePreview
              src={imageUrl}
              alt={news.title}
              className="max-h-40"
              imageClassName="max-h-40 object-cover"
            />
          </div>
        ) : '-'} 
      />
      <FieldDisplay 
        label="Status" 
        value={
          <Badge variant={news.isPublished ? 'default' : 'secondary'}>
            {news.isPublished ? 'Published' : 'Draft'}
          </Badge>
        } 
      />
      <FieldDisplay label="Dipublikasi Pada" value={news.publishedAt ? formatDate(news.publishedAt) : '-'} />
      <FieldDisplay label="Dibuat Pada" value={formatDate(news.createdAt)} />
      <FieldDisplay label="Dibuat Oleh" value={news.createdBy || '-'} />
    </ViewSheet>
  );
}
