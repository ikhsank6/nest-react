import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newsService, type News } from '@/services/news.service';
import { newsCategoryService, type NewsCategory } from '@/services/news-category.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { showSuccess, showError } from '@/lib/utils';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { useTable } from '@/hooks/useTable';
import { newsFormSchema, type NewsFormData } from '@/lib/cms-validations';
import { NewsFormDrawer, NewsViewDrawer } from '@/components/cms/news';

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
    resolver: zodResolver(newsFormSchema),
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
      const response = await newsCategoryService.getAll(1, 100);
      setCategories(response.data || []);
    } catch (error) {
      showError(error);
    }
  };

  const handleSearch = (val: string) => {
    setSearch(val);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
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
    } catch (error: any) {
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

  // Table columns
  const columns: Column<News>[] = [
    {
      key: 'title',
      header: 'Judul',
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium line-clamp-1">{item.title}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">{item.slug}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      cell: (item) => (
        <Badge variant="outline">{item.category?.name || '-'}</Badge>
      ),
    },
    {
      key: 'isPublished',
      header: 'Status',
      cell: (item) => (
        <Badge variant={item.isPublished ? 'default' : 'secondary'} className={item.isPublished ? 'bg-green-500 hover:bg-green-600 border-none text-white' : ''}>
          {item.isPublished ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'viewCount',
      header: 'Views',
      cell: (item) => <span>{item.viewCount}</span>,
    },
    {
      key: 'createdAt',
      header: 'Dibuat',
      cell: (item) => (
        <div className="flex flex-col">
          <span className="text-sm">{new Date(item.createdAt).toLocaleDateString()}</span>
          <span className="text-xs text-muted-foreground">{item.createdBy || '-'}</span>
        </div>
      ),
    },
  ];

  // Table actions
  const tableActions: TableActions<News> = {
    onView: openViewDrawer,
    onEdit: openEditDrawer,
    onDelete: confirmDelete,
  };

  return (
    <div className="w-full">
      <DataTable
        title="Berita"
        description="Kelola postingan berita dan konten website."
        headerAction={
          <Button onClick={openCreateDrawer}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Berita
          </Button>
        }
        data={news}
        columns={columns}
        actions={tableActions}
        loading={loading}
        isError={error}
        onRefresh={fetchNews}
        searchPlaceholder="Cari berita..."
        searchValue={search}
        onSearch={handleSearch}
        emptyMessage="Belum ada berita."
        keyExtractor={(item) => item.uuid}
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        itemsPerPage={limit}
        onItemsPerPageChange={handleLimitChange}
        showPagination={totalItems > 0}
      />

      <NewsViewDrawer
        open={drawerOpen && drawerMode === 'view'}
        onOpenChange={setDrawerOpen}
        news={selectedItem}
        onEdit={(item) => { closeDrawer(); setTimeout(() => openEditDrawer(item), 100); }}
      />

      <NewsFormDrawer
        open={drawerOpen && (drawerMode === 'create' || drawerMode === 'edit')}
        onOpenChange={setDrawerOpen}
        mode={drawerMode === 'create' || drawerMode === 'edit' ? drawerMode : null}
        form={form}
        onSubmit={handleSubmit}
        loading={submitting}
        categories={categories}
      />

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
