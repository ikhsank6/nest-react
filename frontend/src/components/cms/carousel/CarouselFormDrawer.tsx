import { type UseFormReturn } from 'react-hook-form';
import { FormSheet } from '@/components/ui/form-sheet';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { type CarouselFormData } from '@/lib/cms-validations';
import { ImageUpload } from '@/components/ui/image-upload';

interface CarouselFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | null;
  form: UseFormReturn<CarouselFormData>;
  onSubmit: (data: CarouselFormData) => void;
  loading: boolean;
}

export function CarouselFormDrawer({
  open,
  onOpenChange,
  mode,
  form,
  onSubmit,
  loading,
}: CarouselFormDrawerProps) {
  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Tambah Carousel' : 'Edit Carousel'}
      description={mode === 'create' ? 'Buat slide carousel baru.' : 'Ubah data carousel.'}
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
                  <Input placeholder="Masukkan judul" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtitle</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan subtitle (opsional)" {...field} disabled={loading} />
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
                <FormLabel>Gambar <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <ImageUpload 
                    value={field.value} 
                    onChange={(media) => {
                      field.onChange(media);
                      if (media && typeof media === 'object' && 'uuid' in media) {
                        form.setValue('mediaUuid', media.uuid);
                      } else {
                        form.setValue('mediaUuid', undefined);
                      }
                    }} 
                    disabled={loading} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com (opsional)" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Urutan</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Status Aktif</FormLabel>
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
