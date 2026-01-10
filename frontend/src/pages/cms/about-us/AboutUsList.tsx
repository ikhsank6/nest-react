import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { aboutUsService, type AboutUs } from '@/services/about-us.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { showSuccess, showError } from '@/lib/utils';
import { aboutUsFormSchema, type AboutUsFormData } from '@/lib/cms-validations';
import { useTable } from '@/hooks/useTable';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { AboutUsFormDrawer, AboutUsViewDrawer } from '@/components/cms/about-us';
import { AuditInfo } from '@/components/ui/audit-info';

type DrawerMode = 'create' | 'edit' | 'view' | null;

export default function AboutUsList() {
  const {
    data: sections,
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
    refresh: fetchData,
  } = useTable<AboutUs>('aboutUs', useCallback((p, l, s) => aboutUsService.getAll(p, l, s), []));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedItem, setSelectedItem] = useState<AboutUs | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AboutUs | null>(null);

  const form = useForm<AboutUsFormData>({
    resolver: zodResolver(aboutUsFormSchema),
    defaultValues: {
      section: '',
      title: '',
      content: '',
      image: '',
      order: 0,
      isActive: true,
    },
  });

  const handleSearch = (val: string) => setSearch(val);
  const handlePageChange = (p: number) => setPage(p);
  const handleLimitChange = (l: number) => setLimit(l);
  const handleRefresh = () => fetchData();

  const openCreateDrawer = () => {
    form.reset({ section: '', title: '', content: '', image: '', order: 0, isActive: true });
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

  const openViewDrawer = (item: AboutUs) => {
    setSelectedItem(item);
    setDrawerMode('view');
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
    } catch (err) {
      showError(err);
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
    } catch (err) {
      showError(err);
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
      key: 'info',
      header: 'Section',
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.title}</span>
          <span className="text-xs text-muted-foreground">{item.section}</span>
        </div>
      ),
    },
    {
      key: 'order',
      header: 'Urutan',
      cell: (item) => <span className="text-sm">{item.order}</span>,
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

  const tableActions: TableActions<AboutUs> = {
    onView: openViewDrawer,
    onEdit: openEditDrawer,
    onDelete: confirmDelete,
  };

  return (
    <div className="w-full">
      <DataTable
        title="About Us"
        description="Kelola konten halaman About Us."
        headerAction={
          <Button onClick={openCreateDrawer}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Section
          </Button>
        }
        data={sections}
        columns={columns}
        actions={tableActions}
        loading={loading}
        isError={error}
        onRefresh={handleRefresh}
        searchPlaceholder="Cari section..."
        searchValue={search}
        onSearch={handleSearch}
        emptyMessage="Tidak ada section."
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
      <AboutUsViewDrawer
        open={drawerOpen && drawerMode === 'view'}
        onOpenChange={setDrawerOpen}
        section={selectedItem}
        onEdit={(item) => { closeDrawer(); setTimeout(() => openEditDrawer(item), 100); }}
      />

      {/* Create/Edit Form Drawer */}
      <AboutUsFormDrawer
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
        title="Hapus Section"
        itemName={itemToDelete?.title}
        onConfirm={handleDelete}
      />
    </div>
  );
}
