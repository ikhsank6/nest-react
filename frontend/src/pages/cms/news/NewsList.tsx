import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { newsService, type News } from '@/services/news.service';
import { newsCategoryService, type NewsCategory } from '@/services/news-category.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Image as ImageIcon, Newspaper } from 'lucide-react';
import { showSuccess, showError, formatDateTime } from '@/lib/utils';
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
  title: z.string().min(1, 'Judul wajib diisi'),
  slug: z.string().min(1, 'Slug wajib diisi').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan dash'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Konten wajib diisi'),
  image: z.string().optional(),
  categoryUuid: z.string().min(1, 'Kategori wajib dipilih'),
  isPublished: z.boolean().optional(),
});

type NewsFormData = z.infer<typeof newsSchema>;
type DrawerMode = 'create' | 'edit' | 'view' | null;

export default function NewsList() {
  // Use table hook for data with pagination
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

  // Categories state
  const [categories, setCategories] = useState<NewsCategory[]>([]);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedItem, setSelectedItem] = useState<News | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<News | null>(null);

  // Form
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
    } catch (err) {
      console.error('Failed to fetch categories:', err);
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

  const handleSearch = (val: string) => {
    setSearch(val);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
  };

  const handleRefresh = () => {
    fetchNews();
    fetchCategories();
  };

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

  const openViewDrawer = (item: News) => {
    setSelectedItem(item);
    setDrawerMode('view');
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
    } catch (err) {
      showError(err);
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
    } catch (err) {
      showError(err);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const confirmDelete = (item: News) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  // Table columns
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
      header: 'Berita',
      cell: (item) => (
        <div className="flex flex-col max-w-md">
          <span className="font-medium line-clamp-1">{item.title}</span>
          <span className="text-xs text-muted-foreground font-mono">/{item.slug}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      cell: (item) => (
        <Badge variant="outline" className="font-normal">
          {item.category?.name || '-'}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${item.isPublished ? 'bg-green-500' : 'bg-amber-500'}`} />
          <span className="text-sm">{item.isPublished ? 'Published' : 'Draft'}</span>
        </div>
      ),
    },
    {
      key: 'views',
      header: 'Views',
      cell: (item) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Eye className="h-3 w-3" />
          <span className="text-sm font-mono">{item.viewCount}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      cell: (item) => <AuditInfo createdAt={item.createdAt} />,
    },
  ];

  // Table actions
  const getTableActions = (): TableActions<News> => ({
    onView: openViewDrawer,
    onEdit: openEditDrawer,
    onDelete: confirmDelete,
  });

  return (
    <div className="w-full">
      <DataTable
        title="Berita"
        description="Kelola artikel berita dan publikasi."
        headerAction={
          <Button onClick={openCreateDrawer}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Berita
          </Button>
        }
        data={news}
        columns={columns}
        actions={getTableActions()}
        loading={loading}
        isError={error}
        onRefresh={handleRefresh}
        searchPlaceholder="Cari berita..."
        searchValue={search}
        onSearch={handleSearch}
        emptyMessage="Tidak ada berita ditemukan."
        keyExtractor={(item) => item.uuid}
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        itemsPerPage={limit}
        onItemsPerPageChange={handleLimitChange}
        showPagination={totalItems > 0}
      />

      {/* View Drawer */}
      <Sheet open={drawerOpen && drawerMode === 'view'} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detail Berita</SheetTitle>
            <SheetDescription>Informasi lengkap artikel berita</SheetDescription>
          </SheetHeader>
          
          {selectedItem && (
            <div className="mt-6 space-y-4">
              {selectedItem.image && (
                <div className="rounded-lg overflow-hidden">
                  <img src={selectedItem.image} alt={selectedItem.title} className="w-full h-48 object-cover" />
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedItem.title}</h3>
                  <p className="text-sm text-muted-foreground font-mono">/{selectedItem.slug}</p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Badge variant="outline">{selectedItem.category?.name || '-'}</Badge>
                  <Badge variant={selectedItem.isPublished ? 'default' : 'secondary'}>
                    {selectedItem.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    <span className="text-sm">{selectedItem.viewCount} views</span>
                  </div>
                </div>
                
                {selectedItem.excerpt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ringkasan</label>
                    <p className="mt-1 text-sm">{selectedItem.excerpt}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Konten</label>
                  <div className="mt-1 p-3 bg-muted rounded-lg text-sm max-h-48 overflow-y-auto">
                    {selectedItem.content}
                  </div>
                </div>
                
                {selectedItem.publishedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Dipublikasikan</label>
                    <p className="text-sm">{formatDateTime(selectedItem.publishedAt)}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={closeDrawer} 
                  className="flex-1"
                >
                  Tutup
                </Button>
                <Button 
                  type="button" 
                  onClick={() => { closeDrawer(); setTimeout(() => openEditDrawer(selectedItem), 100); }} 
                  className="flex-1"
                >
                  Edit
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create/Edit Form Drawer */}
      <Sheet open={drawerOpen && (drawerMode === 'create' || drawerMode === 'edit')} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {drawerMode === 'create' ? 'Tambah Berita' : 'Edit Berita'}
            </SheetTitle>
            <SheetDescription>
              {drawerMode === 'create'
                ? 'Buat artikel berita baru.'
                : 'Edit detail artikel berita.'}
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan judul berita" {...field} />
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
                    <FormLabel>Kategori</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <FormLabel>Ringkasan (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Deskripsi singkat berita..." rows={2} {...field} />
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
                    <FormLabel>Konten</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Isi berita..." rows={8} {...field} />
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
                    <FormLabel>Featured Image (Opsional)</FormLabel>
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
                      <FormLabel>Publikasikan</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Tampilkan artikel ini ke publik
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
                  Batal
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Berita"
        itemName={itemToDelete?.title}
        onConfirm={handleDelete}
      />
    </div>
  );
}
