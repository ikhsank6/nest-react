import { type UseFormReturn } from 'react-hook-form';
import { FormSheet } from '@/components/ui/form-sheet';
import { Input } from '@/components/ui/input';
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
import { Combobox } from '@/components/ui/combobox';
import { type UserFormData } from '@/lib/validations';
import { type Role } from '@/services/role.service';

interface UserFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | null;
  form: UseFormReturn<UserFormData>;
  onSubmit: (data: UserFormData) => void;
  loading: boolean;
  roles: Role[];
}

export function UserFormDrawer({ 
  open, 
  onOpenChange, 
  mode, 
  form, 
  onSubmit, 
  loading,
  roles 
}: UserFormDrawerProps) {
  // Transform roles to combobox options
  const roleOptions = roles.map((role) => ({
    value: role.uuid,
    label: role.name,
  }));

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Tambah User Baru' : 'Edit User'}
      description={mode === 'create' ? 'Isi form di bawah untuk membuat user baru.' : 'Ubah data user sesuai kebutuhan.'}
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
                <FormLabel>Nama <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Masukkan email" {...field} disabled={loading} />
                </FormControl>
                {mode === 'create' && (
                  <FormDescription>
                    Password sementara akan digenerate otomatis dan dikirim melalui email.
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roleUuid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Combobox
                    options={roleOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pilih role"
                    searchPlaceholder="Cari role..."
                    emptyText="Role tidak ditemukan."
                    disabled={loading}
                  />
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
                  <FormDescription>
                    User aktif dapat login ke sistem
                  </FormDescription>
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

