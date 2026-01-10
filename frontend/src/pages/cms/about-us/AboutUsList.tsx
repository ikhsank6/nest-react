import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { aboutUsService, type AboutUs } from '@/services/about-us.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
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

const aboutUsSchema = z.object({
  section: z.string().min(1, 'Section wajib diisi').regex(/^[a-z0-9-]+$/, 'Section hanya boleh huruf kecil, angka, dan dash'),
  title: z.string().min(1, 'Title wajib diisi'),
  content: z.string().min(1, 'Content wajib diisi'),
  image: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

type AboutUsFormData = z.infer<typeof aboutUsSchema>;
type DrawerMode = 'create' | 'edit' | null;

export default function AboutUsList() {
  const [sections, setSections] = useState<AboutUs[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedItem, setSelectedItem] = useState<AboutUs | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AboutUs | null>(null);

  const form = useForm<AboutUsFormData>({
    resolver: zodResolver(aboutUsSchema),
    defaultValues: {
      section: '',
      title: '',
      content: '',
      image: '',
      order: 0,
      isActive: true,
    },
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await aboutUsService.getAll(true);
      setSections(response?.data || []);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateDrawer = () => {
    form.reset({
      section: '',
      title: '',
      content: '',
      image: '',
      order: 0,
      isActive: true,
    });
    setSelectedItem(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: AboutUs) => {
    setSelectedItem(item);
    form.reset({
      section: item.section,
      title: item.title,
      content: item.content,
      image: item.image || '',
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

  const handleSubmit = async (data: AboutUsFormData) => {
    setSubmitting(true);
    try {
      if (drawerMode === 'create') {
        await aboutUsService.create(data);
        showSuccess('Section berhasil dibuat');
      } else if (drawerMode === 'edit' && selectedItem) {
        await aboutUsService.update(selectedItem.uuid, data);
        showSuccess('Section berhasil diupdate');
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
      await aboutUsService.delete(itemToDelete.uuid);
      showSuccess('Section berhasil dihapus');
      fetchData();
    } catch (error) {
      showError(error);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const confirmDelete = (item: AboutUs) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const columns: Column<AboutUs>[] = [
    {
      key: 'section',
      header: 'Section',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{item.section}</span>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Title',
      cell: (item) => <span className="font-medium">{item.title}</span>,
    },
    {
      key: 'content',
      header: 'Content Preview',
      cell: (item) => (
        <span className="text-sm text-muted-foreground line-clamp-2 max-w-md">
          {item.content.replace(/<[^>]*>/g, '').slice(0, 100)}...
        </span>
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

  const tableActions: TableActions<AboutUs> = {
    onEdit: openEditDrawer,
    onDelete: confirmDelete,
  };

  return (
    <div className="w-full">
      <DataTable
        title="About Us"
        description="Manage about us page sections."
        headerAction={
          <Button onClick={openCreateDrawer}>
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
        }
        data={sections}
        columns={columns}
        actions={tableActions}
        loading={loading}
        onRefresh={fetchData}
        emptyMessage="No sections found."
        keyExtractor={(item) => item.uuid}
        showPagination={false}
      />

      {/* Form Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {drawerMode === 'create' ? 'Add Section' : 'Edit Section'}
            </SheetTitle>
            <SheetDescription>
              {drawerMode === 'create'
                ? 'Create a new about us section.'
                : 'Edit section details.'}
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-6">
              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section ID</FormLabel>
                    <FormControl>
                      <Input placeholder="vision, mission, history, team" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter section title" {...field} />
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
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Section content (HTML supported)..." rows={8} {...field} />
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
                    <FormLabel>Image (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="/uploads/about/image.jpg" {...field} />
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
                        Show this section on the about us page
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
        title="Delete Section"
        itemName={itemToDelete?.title}
        onConfirm={handleDelete}
      />
    </div>
  );
}
