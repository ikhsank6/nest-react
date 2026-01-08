import type { UseFormReturn } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type CreateMenuFormData } from '@/lib/validations';
import { type Menu } from '@/services/menu.service';

interface MenuFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | null;
  form: UseFormReturn<CreateMenuFormData>;
  onSubmit: (data: CreateMenuFormData) => void;
  loading: boolean;
  parents: Menu[];
  currentMenuUuid?: string;
}

export function MenuFormDrawer({ 
  open, 
  onOpenChange, 
  mode, 
  form, 
  onSubmit, 
  loading,
  parents,
  currentMenuUuid
}: MenuFormDrawerProps) {
  // Filter out the current menu so it can't be its own parent
  const availableParents = parents.filter(p => !currentMenuUuid || p.uuid !== currentMenuUuid);

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Tambah Menu Baru' : 'Edit Menu'}
      description={mode === 'create' ? 'Isi form di bawah untuk membuat menu baru.' : 'Ubah data menu sesuai kebutuhan.'}
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
                <FormLabel>Nama Menu <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama menu" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="path"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Path</FormLabel>
                <FormControl>
                  <Input placeholder="/url-path" {...field} value={field.value || ''} disabled={loading} />
                </FormControl>
                <FormDescription>Path URL untuk routing (opsional untuk parent)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <FormControl>
                  <Input placeholder="lucide-icon-name" {...field} value={field.value || ''} disabled={loading} />
                </FormControl>
                <FormDescription>Nama icon dari Lucide Icons</FormDescription>
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
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                    disabled={loading} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parentUuid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Menu</FormLabel>
                <Select 
                  onValueChange={(val) => field.onChange(val === 'root' ? null : val)} 
                  value={field.value || 'root'} 
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih parent (opsional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="root">(Root / Tidak ada parent)</SelectItem>
                    {availableParents.map((menu) => (
                      <SelectItem key={menu.uuid} value={menu.uuid}>
                        {menu.name}
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
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Status Aktif</FormLabel>
                  <FormDescription>
                    Menu ditampilkan di sidebar
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
