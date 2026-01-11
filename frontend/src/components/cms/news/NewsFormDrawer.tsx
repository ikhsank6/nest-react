import { type UseFormReturn } from 'react-hook-form';
import { FormSheet } from '@/components/ui/form-sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type NewsFormData } from '@/lib/cms-validations';
import { type NewsCategory } from '@/services/news-category.service';
import { ImageUpload } from '@/components/ui/image-upload';

interface NewsFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | null;
  form: UseFormReturn<NewsFormData>;
  onSubmit: (data: NewsFormData) => void;
  loading: boolean;
  categories: NewsCategory[];
}

export function NewsFormDrawer({
  open,
  onOpenChange,
  mode,
  form,
  onSubmit,
  loading,
  categories,
}: NewsFormDrawerProps) {
  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Tambah Berita' : 'Edit Berita'}
      description={mode === 'create' ? 'Buat postingan berita baru.' : 'Ubah data berita.'}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel={mode === 'create' ? 'Simpan' : 'Update'}
      loading={loading}
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judul <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input
                    placeholder="Masukkan judul berita"
                    {...field}
                    disabled={loading}
                    onChange={(e) => {
                      field.onChange(e);
                      if (mode === 'create') {
                        form.setValue('slug', generateSlug(e.target.value));
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="judul-berita" {...field} disabled={loading} />
                </FormControl>
                <FormDescription>URL-friendly identifier.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryUuid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.uuid} value={cat.uuid}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ringkasan</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ringkasan singkat berita..."
                    {...field}
                    disabled={loading}
                    rows={2}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gambar Utama</FormLabel>
                <FormControl>
                  <ImageUpload 
                    value={field.value || ''} 
                    onChange={field.onChange} 
                    disabled={loading} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konten <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Isi berita lengkap..."
                    {...field}
                    disabled={loading}
                    rows={8}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Publish</FormLabel>
                  <FormDescription>Tampilkan berita di website</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </Form>
    </FormSheet>
  );
}
