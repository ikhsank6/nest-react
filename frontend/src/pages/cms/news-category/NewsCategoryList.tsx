import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { newsCategoryService, type NewsCategory } from '@/services/news-category.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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

const categorySchema = z.object({
  name: z.string().min(1, 'Name wajib diisi'),
  slug: z.string().min(1, 'Slug wajib diisi').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan dash'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;
type DrawerMode = 'create' | 'edit' | null;

export default function NewsCategoryList() {
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedItem, setSelectedItem] = useState<NewsCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<NewsCategory | null>(null);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      isActive: true,
    },
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await newsCategoryService.getAll(true);
      setCategories(response?.data || []);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-generate slug from name
  const watchName = form.watch('name');
  useEffect(() => {
    if (drawerMode === 'create' && watchName) {
      const slug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      form.setValue('slug', slug);
    }
  }, [watchName, drawerMode, form]);

  const openCreateDrawer = () => {
    form.reset({
      name: '',
      slug: '',
      description: '',
      isActive: true,
    });
    setSelectedItem(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: NewsCategory) => {
    setSelectedItem(item);
    form.reset({
      name: item.name,
      slug: item.slug,
      description: item.description || '',
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

  const handleSubmit = async (data: CategoryFormData) => {
    setSubmitting(true);
    try {
      if (drawerMode === 'create') {
        await newsCategoryService.create(data);
        showSuccess('Kategori berhasil dibuat');
      } else if (drawerMode === 'edit' && selectedItem) {
        await newsCategoryService.update(selectedItem.uuid, data);
        showSuccess('Kategori berhasil diupdate');
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
      await newsCategoryService.delete(itemToDelete.uuid);
      showSuccess('Kategori berhasil dihapus');
      fetchData();
    } catch (error) {
      showError(error);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const confirmDelete = (item: NewsCategory) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const columns: Column<NewsCategory>[] = [
    {
      key: 'name',
      header: 'Category',
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.name}</span>
          <span className="text-xs text-muted-foreground font-mono">/{item.slug}</span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      cell: (item) => (
        <span className="text-sm text-muted-foreground line-clamp-2">
          {item.description || '-'}
        </span>
      ),
    },
    {
      key: 'newsCount',
      header: 'News',
      cell: (item) => (
        <Badge variant="outline">{item._count?.news || 0} articles</Badge>
      ),
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

  const tableActions: TableActions<NewsCategory> = {
    onEdit: openEditDrawer,
    onDelete: confirmDelete,
  };

  return (
    <div className="w-full">
      <DataTable
        title="News Categories"
        description="Manage news categories for organizing articles."
        headerAction={
          <Button onClick={openCreateDrawer}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        }
        data={categories}
        columns={columns}
        actions={tableActions}
        loading={loading}
        onRefresh={fetchData}
        emptyMessage="No categories found."
        keyExtractor={(item) => item.uuid}
        showPagination={false}
      />

      {/* Form Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {drawerMode === 'create' ? 'Add Category' : 'Edit Category'}
            </SheetTitle>
            <SheetDescription>
              {drawerMode === 'create'
                ? 'Create a new news category.'
                : 'Edit category details.'}
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
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
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="category-slug" {...field} />
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter description" {...field} />
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
                        Show this category on the website
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
        title="Delete Category"
        itemName={itemToDelete?.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}
