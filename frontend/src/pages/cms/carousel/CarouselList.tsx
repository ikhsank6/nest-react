import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { carouselService, type Carousel } from '@/services/carousel.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { showSuccess, showError } from '@/lib/utils';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { AuditInfo } from '@/components/ui/audit-info';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const carouselSchema = z.object({
  title: z.string().min(1, 'Title wajib diisi'),
  subtitle: z.string().optional(),
  image: z.string().min(1, 'Image path wajib diisi'),
  link: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

type CarouselFormData = z.infer<typeof carouselSchema>;
type DrawerMode = 'create' | 'edit' | null;

export default function CarouselList() {
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedItem, setSelectedItem] = useState<Carousel | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Carousel | null>(null);

  const form = useForm<CarouselFormData>({
    resolver: zodResolver(carouselSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      image: '',
      link: '',
      order: 0,
      isActive: true,
    },
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await carouselService.getAll(true);
      setCarousels(response?.data || []);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useState(() => {
    fetchData();
  });

  const openCreateDrawer = () => {
    form.reset({
      title: '',
      subtitle: '',
      image: '',
      link: '',
      order: 0,
      isActive: true,
    });
    setSelectedItem(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: Carousel) => {
    setSelectedItem(item);
    form.reset({
      title: item.title,
      subtitle: item.subtitle || '',
      image: item.image,
      link: item.link || '',
      order: item.order,
      isActive: item.isActive,
    });
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerMode(null);
    setSelectedItem(null);
  };

  const handleSubmit = async (data: CarouselFormData) => {
    setSubmitting(true);
    try {
      if (drawerMode === 'create') {
        await carouselService.create(data);
        showSuccess('Carousel berhasil dibuat');
      } else if (drawerMode === 'edit' && selectedItem) {
        await carouselService.update(selectedItem.uuid, data);
        showSuccess('Carousel berhasil diupdate');
      }
      closeDrawer();
      fetchData();
    } catch (error) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await carouselService.delete(itemToDelete.uuid);
      showSuccess('Carousel berhasil dihapus');
      fetchData();
    } catch (error) {
      showError(error);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const confirmDelete = (item: Carousel) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const columns: Column<Carousel>[] = [
    {
      key: 'image',
      header: 'Preview',
      cell: (item) => (
        <div className="h-16 w-24 rounded-md overflow-hidden bg-muted flex items-center justify-center">
          {item.image ? (
            <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Title',
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.title}</span>
          {item.subtitle && (
            <span className="text-xs text-muted-foreground">{item.subtitle}</span>
          )}
        </div>
      ),
    },
    {
      key: 'order',
      header: 'Order',
      cell: (item) => <span className="font-mono">{item.order}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (item) => (
        <Badge variant={item.isActive ? 'default' : 'secondary'}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      cell: (item) => <AuditInfo createdAt={item.createdAt} />,
    },
  ];

  const tableActions: TableActions<Carousel> = {
    onEdit: openEditDrawer,
    onDelete: confirmDelete,
  };

  return (
    <div className="w-full">
      <DataTable
        title="Carousel"
        description="Manage homepage carousel slides."
        headerAction={
          <Button onClick={openCreateDrawer}>
            <Plus className="mr-2 h-4 w-4" />
            Add Carousel
          </Button>
        }
        data={carousels}
        columns={columns}
        actions={tableActions}
        loading={loading}
        onRefresh={fetchData}
        emptyMessage="No carousel items found."
        keyExtractor={(item) => item.uuid}
        showPagination={false}
      />

      {/* Form Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {drawerMode === 'create' ? 'Add Carousel' : 'Edit Carousel'}
            </SheetTitle>
            <SheetDescription>
              {drawerMode === 'create'
                ? 'Create a new carousel slide.'
                : 'Edit carousel slide details.'}
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title" {...field} />
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
                    <FormLabel>Subtitle (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter subtitle" {...field} />
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
                    <FormLabel>Image Path</FormLabel>
                    <FormControl>
                      <Input placeholder="/uploads/carousel/image.jpg" {...field} />
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
                    <FormLabel>Link (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
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
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Active</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Show this carousel on the homepage
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeDrawer} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Carousel"
        itemName={itemToDelete?.title}
        onConfirm={handleDelete}
      />
    </div>
  );
}
