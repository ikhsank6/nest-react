import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { newsService, type News } from '@/services/news.service';
import { newsCategoryService, type NewsCategory } from '@/services/news-category.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Image as ImageIcon } from 'lucide-react';
import { showSuccess, showError } from '@/lib/utils';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { AuditInfo } from '@/components/ui/audit-info';
import { useTable } from '@/hooks/useTable';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const newsSchema = z.object({
  title: z.string().min(1, 'Title wajib diisi'),
  slug: z.string().min(1, 'Slug wajib diisi').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan dash'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content wajib diisi'),
  image: z.string().optional(),
  categoryUuid: z.string().min(1, 'Category wajib dipilih'),
  isPublished: z.boolean().optional(),
});

type NewsFormData = z.infer<typeof newsSchema>;
type DrawerMode = 'create' | 'edit' | null;

export default function NewsList() {
  const {
    data: news,
    loading,
    error,
    search,
    page,
    limit,
    totalPages,
    totalItems,
    setPage,
    setLimit,
    setSearch,
    refresh: fetchNews,
  } = useTable<News>('news', useCallback((p, l, s) => newsService.getAll(p, l, s, undefined, true), []));

  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedItem, setSelectedItem] = useState<News | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<News | null>(null);

  const form = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image: '',
      categoryUuid: '',
      isPublished: false,
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await newsCategoryService.getAll(true);
      setCategories(response?.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Auto-generate slug from title
  const watchTitle = form.watch('title');
  useEffect(() => {
    if (drawerMode === 'create' && watchTitle) {
      const slug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      form.setValue('slug', slug);
    }
  }, [watchTitle, drawerMode, form]);

  const openCreateDrawer = () => {
    form.reset({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image: '',
      categoryUuid: '',
      isPublished: false,
    });
    setSelectedItem(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEditDrawer = (item: News) => {
    setSelectedItem(item);
    form.reset({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || '',
      content: item.content,
      image: item.image || '',
      categoryUuid: item.category?.uuid || '',
      isPublished: item.isPublished,
    });
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerMode(null);
    setSelectedItem(null);
  };

  const handleSubmit = async (data: NewsFormData) => {
    setSubmitting(true);
    try {
      if (drawerMode === 'create') {
        await newsService.create(data);
        showSuccess('Berita berhasil dibuat');
      } else if (drawerMode === 'edit' && selectedItem) {
        await newsService.update(selectedItem.uuid, data);
        showSuccess('Berita berhasil diupdate');
      }
      closeDrawer();
      fetchNews();
    } catch (error) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await newsService.delete(itemToDelete.uuid);
      showSuccess('Berita berhasil dihapus');
      fetchNews();
    } catch (error) {
      showError(error);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const confirmDelete = (item: News) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const columns: Column<News>[] = [
    {
      key: 'image',
      header: 'Image',
      cell: (item) => (
        <div className="h-12 w-16 rounded overflow-hidden bg-muted flex items-center justify-center">
          {item.image ? (
            <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Title',
      cell: (item) => (
        <div className="flex flex-col max-w-md">
          <span className="font-medium line-clamp-1">{item.title}</span>
          <span className="text-xs text-muted-foreground font-mono">/{item.slug}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      cell: (item) => (
        <Badge variant="outline">{item.category?.name || '-'}</Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (item) => (
        <Badge variant={item.isPublished ? 'default' : 'secondary'}>
          {item.isPublished ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'views',
      header: 'Views',
      cell: (item) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Eye className="h-3 w-3" />
          <span className="text-sm">{item.viewCount}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      cell: (item) => <AuditInfo createdAt={item.createdAt} />,
    },
  ];

  const tableActions: TableActions<News> = {
    onEdit: openEditDrawer,
    onDelete: confirmDelete,
  };

  return (
    <div className="w-full">
      <DataTable
        title="News"
        description="Manage news articles and publications."
        headerAction={
          <Button onClick={openCreateDrawer}>
            <Plus className="mr-2 h-4 w-4" />
            Add News
          </Button>
        }
        data={news}
        columns={columns}
        actions={tableActions}
        loading={loading}
        isError={error}
        onRefresh={fetchNews}
        searchPlaceholder="Search news..."
        searchValue={search}
        onSearch={setSearch}
        emptyMessage="No news found."
        keyExtractor={(item) => item.uuid}
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
        itemsPerPage={limit}
        onItemsPerPageChange={setLimit}
        showPagination={totalItems > 0}
      />

      {/* Form Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {drawerMode === 'create' ? 'Add News' : 'Edit News'}
            </SheetTitle>
            <SheetDescription>
              {drawerMode === 'create'
                ? 'Create a new news article.'
                : 'Edit news article details.'}
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
                      <Input placeholder="Enter news title" {...field} />
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
                      <Input placeholder="news-slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryUuid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
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
                    <FormLabel>Excerpt (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Short description..." rows={2} {...field} />
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
                      <Textarea placeholder="News content..." rows={8} {...field} />
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
                    <FormLabel>Featured Image (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="/uploads/news/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Publish</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Make this article visible to the public
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
        title="Delete News"
        itemName={itemToDelete?.title}
        onConfirm={handleDelete}
      />
    </div>
  );
}
