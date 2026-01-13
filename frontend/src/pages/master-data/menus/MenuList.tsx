import { useState, useCallback } from 'react';
import { useRequestGuard } from '@/hooks/useRequestGuard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { menuService, type Menu } from '@/services/menu.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { showSuccess, showError } from '@/lib/utils';
import { createMenuSchema, type CreateMenuFormData } from '@/lib/validations';
import { useTable } from '@/hooks/useTable';
import { MenuViewDrawer } from '@/components/master-data/menus/MenuViewDrawer';
import { MenuFormDrawer } from '@/components/master-data/menus/MenuFormDrawer';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { Badge } from '@/components/ui/badge';
import { AuditInfo } from '@/components/ui/audit-info';

type DrawerMode = 'create' | 'edit' | 'view' | null;

export default function MenuList() {
  // Use table state from store
  const {
    data: menus,
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
    setData,
    refresh: fetchMenus,
  } = useTable<Menu>('menus', useCallback((_page, _limit, filters) => {
    return menuService.getAll({ search: filters.search });
  }, []));

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { withRequestGuard } = useRequestGuard();
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null);

  // Form
  const form = useForm<CreateMenuFormData>({
    resolver: zodResolver(createMenuSchema),
    defaultValues: {
      name: '',
      path: '',
      icon: '',
      order: 0,
      isActive: true,
      parentUuid: null,
    },
  });

  const handleSearch = (val: string) => {
    setFilters({ search: val || undefined });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
  };

  const handleRefresh = () => {
    fetchMenus();
  };
  
  const handleReorder = withRequestGuard(async (newMenus: Menu[]) => {
      // Optimistic update with updated order numbers
      const updatedMenus = newMenus.map((menu, index) => ({
        ...menu,
        order: index + 1
      }));
      setData(updatedMenus);

      try {
        const items = updatedMenus.map(m => ({
          uuid: m.uuid,
          order: m.order,
          parentUuid: m.parent?.uuid // Preserve parent
        }));
        await menuService.reorder(items);
        showSuccess('Urutan menu berhasil diperbarui');
      } catch (error) {
        showError(error);
        fetchMenus(); // Revert by fetching
      }
  });

  const handleReparent = withRequestGuard(async (itemId: string, newParentId: string | null) => {
    // Find the menu being moved
    const menuToMove = menus.find(m => m.uuid === itemId);
    const newParent = menus.find(m => m.uuid === newParentId);
    
    if (!menuToMove || !newParent) return;
    
    // Prevent making a menu its own child or child of its current children
    if (menuToMove.uuid === newParent.uuid) return;
    
    // Optimistic update
    const updatedMenus = menus.map(menu => {
      if (menu.uuid === itemId) {
        return {
          ...menu,
          parent: newParent,
        };
      }
      return menu;
    });
    setData(updatedMenus);

    try {
      // Send reorder request with updated parent
      const items = [{
        uuid: itemId,
        order: menuToMove.order,
        parentUuid: newParentId
      }];
      await menuService.reorder(items);
      showSuccess(`${menuToMove.name} dipindahkan ke ${newParent.name}`);
      fetchMenus(); // Refresh to get proper order
    } catch (error) {
      showError(error);
      fetchMenus(); // Revert by fetching
    }
  });

  // Check if a menu can be a parent (only root menus can be parents)
  const canBeParent = (menu: Menu) => !menu.parent;

  const openCreateDrawer = () => {
    form.reset({
      name: '',
      path: '',
      icon: '',
      order: 0,
      isActive: true,
      parentUuid: null,
    });
    setSelectedMenu(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEditDrawer = (menu: Menu) => {
    setSelectedMenu(menu);
    form.reset({
      name: menu.name,
      path: menu.path || '',
      icon: menu.icon || '',
      order: menu.order,
      isActive: menu.isActive,
      parentUuid: menu.parent?.uuid || null,
    });
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const openViewDrawer = (menu: Menu) => {
    setSelectedMenu(menu);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerMode(null);
    setSelectedMenu(null);
  };

  const handleSubmit = withRequestGuard(async (data: CreateMenuFormData) => {
    setSubmitting(true);
    try {
      if (drawerMode === 'create') {
        await menuService.create(data);
        showSuccess('Menu berhasil dibuat');
      } else if (drawerMode === 'edit' && selectedMenu) {
        await menuService.update(selectedMenu.uuid, data);
        showSuccess('Menu berhasil diupdate');
      }
      
      closeDrawer();
      fetchMenus();
    } catch (error: any) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  });

  const handleDelete = withRequestGuard(async () => {
    if (!menuToDelete) return;
    
    try {
      await menuService.delete(menuToDelete.uuid);
      showSuccess('Menu berhasil dihapus');
      fetchMenus();
    } catch (error: any) {
      showError(error);
    } finally {
      setDeleteDialogOpen(false);
      setMenuToDelete(null);
    }
  });

  const confirmDelete = (menu: Menu) => {
    setMenuToDelete(menu);
    setDeleteDialogOpen(true);
  };

  // Table columns
  const columns: Column<Menu>[] = [
    {
      key: 'name',
      header: 'Nama Menu',
      cell: (menu) => (
        <div className="flex items-center">
          {menu.parent && <span className="w-6 border-l-2 border-b-2 border-muted-foreground/30 h-4 mr-2 rounded-bl-sm" />}
          <span className="font-medium">{menu.name}</span>
        </div>
      ),
    },
    {
      key: 'parent',
      header: 'Parent',
      cell: (menu) => (
        <span className="text-muted-foreground text-sm">
          {menu.parent?.name || '-'}
        </span>
      ),
    },
    {
      key: 'path',
      header: 'Path',
      cell: (menu) => <span className="text-muted-foreground font-mono text-xs">{menu.path || '-'}</span>,
    },
    {
      key: 'order',
      header: 'Order',
      cell: (menu) => <span>{menu.order}</span>,
    },
    {
      key: 'isActive',
      header: 'Status',
      cell: (menu) => (
        <Badge variant={menu.isActive ? 'default' : 'secondary'} className={menu.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
          {menu.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      cell: (menu) => (
        <AuditInfo 
          createdAt={menu.createdAt} 
          createdBy={menu.createdBy} 
        />
      ),
    },
  ];

  // Table actions
  const tableActions: TableActions<Menu> = {
    onView: openViewDrawer,
    onEdit: openEditDrawer,
    onDelete: confirmDelete,
  };

  return (
    <div className="w-full">
      <DataTable
        title="Menus"
        description="Manage system navigation menus."
        headerAction={
          <Button onClick={openCreateDrawer}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Menu
          </Button>
        }
        data={menus || []}
        columns={columns}
        actions={tableActions}
        loading={loading}
        isError={error}
        onRefresh={handleRefresh}
        searchPlaceholder="Cari menu..."
        searchValue={filters.search || ''}
        onSearch={handleSearch}
        emptyMessage="No menus found."
        keyExtractor={(menu) => menu.uuid}
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        itemsPerPage={limit}
        onItemsPerPageChange={handleLimitChange}
        showPagination={totalItems > 0}
        onReorder={handleReorder}
        onReparent={handleReparent}
        canBeParent={canBeParent}
      />

      <MenuViewDrawer
        open={drawerOpen && drawerMode === 'view'}
        onOpenChange={setDrawerOpen}
        menu={selectedMenu}
        onEdit={(menu) => { closeDrawer(); setTimeout(() => openEditDrawer(menu), 100); }}
      />

      <MenuFormDrawer
        open={drawerOpen && (drawerMode === 'create' || drawerMode === 'edit')}
        onOpenChange={setDrawerOpen}
        mode={drawerMode === 'create' || drawerMode === 'edit' ? drawerMode : null}
        form={form}
        onSubmit={handleSubmit}
        loading={submitting}
        parents={menus || []} // Use menus directly as they are now flat
        currentMenuUuid={selectedMenu?.uuid}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Menu"
        itemName={menuToDelete?.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}
