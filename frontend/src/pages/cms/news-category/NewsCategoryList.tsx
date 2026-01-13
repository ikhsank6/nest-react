import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newsCategoryService, type NewsCategory } from '@/services/news-category.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { showSuccess, showError } from '@/lib/utils';
import { newsCategoryFormSchema, type NewsCategoryFormData } from '@/lib/cms-validations';
import { useTable } from '@/hooks/useTable';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { NewsCategoryFormDrawer, NewsCategoryViewDrawer } from '@/components/cms/news-category';
import { AuditInfo } from '@/components/ui/audit-info';

type DrawerMode = 'create' | 'edit' | 'view' | null;

export default function NewsCategoryList() {
  const {
    data: categories,
    loading,
    error,
    filters,
    page,
    limit,
    totalPages,
    totalItems,
    setPage,
    setLimit,
    setFilters,
    refresh: fetchData,
  } = useTable<NewsCategory>('newsCategories', useCallback((p, l, f) => newsCategoryService.getAll(p, l, f), []));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedItem, setSelectedItem] = useState<NewsCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<NewsCategory | null>(null);

  const form = useForm<NewsCategoryFormData>({
    resolver: zodResolver(newsCategoryFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      isActive: true,
    },
  });

  const handleSearch = (val: string) => setFilters({ search: val || undefined });
  const handlePageChange = (p: number) => setPage(p);
  const handleLimitChange = (l: number) => setLimit(l);
  const handleRefresh = () => fetchData();

  const openCreateDrawer = () => {
    form.reset({ name: '', slug: '', description: '', isActive: true });
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

  const openViewDrawer = (item: NewsCategory) => {
    setSelectedItem(item);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerMode(null);
    setSelectedItem(null);
  };

  const handleSubmit = async (data: NewsCategoryFormData) => {
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
    } catch (err) {
      showError(err);
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
    } catch (err) {
      showError(err);
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
      key: 'info',
      header: 'Kategori',
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.name}</span>
          <span className="text-xs text-muted-foreground">{item.slug}</span>
        </div>
      ),
    },
    {
      key: 'newsCount',
      header: 'Jumlah Berita',
      cell: (item) => <span className="text-sm">{item._count?.news || 0}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${item.isActive ? 'bg-green-500' : 'bg-muted-foreground'}`} />
          <span className="text-sm">{item.isActive ? 'Aktif' : 'Nonaktif'}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Dibuat',
      cell: (item) => <AuditInfo createdAt={item.createdAt} createdBy={item.createdBy} />,
    },
  ];

  const tableActions: TableActions<NewsCategory> = {
    onView: openViewDrawer,
    onEdit: openEditDrawer,
    onDelete: confirmDelete,
  };

  return (
    <div className="w-full">
      <DataTable
        title="Kategori Berita"
        description="Kelola kategori untuk berita."
        headerAction={
          <Button onClick={openCreateDrawer}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kategori
          </Button>
        }
        data={categories}
        columns={columns}
        actions={tableActions}
        loading={loading}
        isError={error}
        onRefresh={handleRefresh}
        searchPlaceholder="Cari kategori..."
        searchValue={filters.search || ''}
        onSearch={handleSearch}
        emptyMessage="Tidak ada kategori."
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
      <NewsCategoryViewDrawer
        open={drawerOpen && drawerMode === 'view'}
        onOpenChange={setDrawerOpen}
        category={selectedItem}
        onEdit={(item) => { closeDrawer(); setTimeout(() => openEditDrawer(item), 100); }}
      />

      {/* Create/Edit Form Drawer */}
      <NewsCategoryFormDrawer
        open={drawerOpen && (drawerMode === 'create' || drawerMode === 'edit')}
        onOpenChange={setDrawerOpen}
        mode={drawerMode === 'create' || drawerMode === 'edit' ? drawerMode : null}
        form={form}
        onSubmit={handleSubmit}
        loading={submitting}
      />

      {/* Delete Confirmation */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Kategori"
        itemName={itemToDelete?.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}
