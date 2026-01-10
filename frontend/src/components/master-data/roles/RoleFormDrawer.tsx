import type { UseFormReturn } from 'react-hook-form';
import { FormSheet } from '@/components/ui/form-sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { type CreateRoleFormData } from '@/lib/validations';

interface RoleFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | null;
  form: UseFormReturn<CreateRoleFormData>;
  onSubmit: (data: CreateRoleFormData) => void;
  loading: boolean;
}

export function RoleFormDrawer({ 
  open, 
  onOpenChange, 
  mode, 
  form, 
  onSubmit, 
  loading 
}: RoleFormDrawerProps) {
  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Tambah Role Baru' : 'Edit Role'}
      description={mode === 'create' ? 'Isi form di bawah untuk membuat role baru.' : 'Ubah data role sesuai kebutuhan.'}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel={mode === 'create' ? 'Simpan' : 'Update'}
      loading={loading}
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Role <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama role" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi</FormLabel>
                <FormControl>
                  <Textarea placeholder="Masukkan deskripsi role (opsional)" {...field} disabled={loading} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </FormSheet>
  );
}
