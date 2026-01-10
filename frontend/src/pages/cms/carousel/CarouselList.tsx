import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { carouselService, type Carousel } from '@/services/carousel.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { showSuccess, showError } from '@/lib/utils';
import { carouselFormSchema, type CarouselFormData } from '@/lib/cms-validations';
import { useTable } from '@/hooks/useTable';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { CarouselFormDrawer, CarouselViewDrawer } from '@/components/cms/carousel';
import { AuditInfo } from '@/components/ui/audit-info';

type DrawerMode = 'create' | 'edit' | 'view' | null;

export default function CarouselList() {
  const {
    data: carousels,
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
  } = useTable<Carousel>('carousels', useCallback((p, l, s) => carouselService.getAll(p, l, s), []));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedItem, setSelectedItem] = useState<Carousel | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Carousel | null>(null);

  const form = useForm<CarouselFormData>({
    resolver: zodResolver(carouselFormSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      image: '',
      link: '',
      order: 0,
      isActive: true,
    },
  });

  const handleSearch = (val: string) => setSearch(val);
  const handlePageChange = (p: number) => setPage(p);
  const handleLimitChange = (l: number) => setLimit(l);
  const handleRefresh = () => fetchData();

  const openCreateDrawer = () => {
    form.reset({ title: '', subtitle: '', image: '', link: '', order: 0, isActive: true });
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

  const openViewDrawer = (item: Carousel) => {
    setSelectedItem(item);
    setDrawerMode('view');
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
    } catch (err) {
      showError(err);
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
    } catch (err) {
      showError(err);
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
      key: 'info',
      header: 'Carousel',
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.title}</span>
          {item.subtitle && <span className="text-xs text-muted-foreground">{item.subtitle}</span>}
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

  const tableActions: TableActions<Carousel> = {
    onView: openViewDrawer,
    onEdit: openEditDrawer,
    onDelete: confirmDelete,
  };

  return (
    <div className="w-full">
      <DataTable
        title="Carousel"
        description="Kelola slide carousel untuk halaman utama."
        headerAction={
          <Button onClick={openCreateDrawer}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Carousel
          </Button>
        }
        data={carousels}
        columns={columns}
        actions={tableActions}
        loading={loading}
        isError={error}
        onRefresh={handleRefresh}
        searchPlaceholder="Cari carousel..."
        searchValue={search}
        onSearch={handleSearch}
        emptyMessage="Tidak ada carousel."
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
      <CarouselViewDrawer
        open={drawerOpen && drawerMode === 'view'}
        onOpenChange={setDrawerOpen}
        carousel={selectedItem}
        onEdit={(item) => { closeDrawer(); setTimeout(() => openEditDrawer(item), 100); }}
      />

      {/* Create/Edit Form Drawer */}
      <CarouselFormDrawer
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
        title="Hapus Carousel"
        itemName={itemToDelete?.title}
        onConfirm={handleDelete}
      />
    </div>
  );
}
