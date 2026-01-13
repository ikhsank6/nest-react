import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { roleService, type Role } from '@/services/role.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { showSuccess, showError } from '@/lib/utils';
import { createRoleSchema, type CreateRoleFormData } from '@/lib/validations';
import { useTable } from '@/hooks/useTable';
import { RoleViewDrawer } from '@/components/master-data/roles/RoleViewDrawer';
import { RoleFormDrawer } from '@/components/master-data/roles/RoleFormDrawer';
import { MenuAccessDrawer } from '@/components/master-data/roles/MenuAccessDrawer';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { AuditInfo } from '@/components/ui/audit-info';

type DrawerMode = 'create' | 'edit' | 'view' | null;

export default function RoleList() {
  // Use table state from store
  const {
    data: roles,
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
    refresh: fetchRoles,
  } = useTable<Role>('roles', useCallback((p, l, f) => roleService.getAll(p, l, f), []));
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Permissions drawer state
  const [permissionsDrawerOpen, setPermissionsDrawerOpen] = useState(false);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  // Form
  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
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
    fetchRoles();
  };

  const openCreateDrawer = () => {
    form.reset({
      name: '',
      description: '',
      isActive: true,
    });
    setSelectedRole(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEditDrawer = (role: Role) => {
    setSelectedRole(role);
    form.reset({
      name: role.name,
      description: role.description || '',
      isActive: role.isActive,
    });
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const openViewDrawer = (role: Role) => {
    setSelectedRole(role);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const openPermissionsDrawer = (role: Role) => {
    setSelectedRole(role);
    setPermissionsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerMode(null);
    setSelectedRole(null);
  };

  const handleSubmit = async (data: CreateRoleFormData) => {
    setSubmitting(true);
    try {
      if (drawerMode === 'create') {
        await roleService.create(data);
        showSuccess('Role berhasil dibuat');
      } else if (drawerMode === 'edit' && selectedRole) {
        await roleService.update(selectedRole.uuid, data);
        showSuccess('Role berhasil diupdate');
      }
      
      closeDrawer();
      fetchRoles();
    } catch (error: any) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;
    
    try {
      await roleService.delete(roleToDelete.uuid);
      showSuccess('Role berhasil dihapus');
      fetchRoles();
    } catch (error) {
      showError(error);
    } finally {
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  const confirmDelete = (role: Role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  // Table columns
  const columns: Column<Role>[] = [
    {
      key: 'name',
      header: 'Nama Role',
      cell: (role) => <span className="font-medium">{role.name}</span>,
    },
    {
      key: 'description',
      header: 'Deskripsi',
      cell: (role) => <span className="text-muted-foreground">{role.description || '-'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created At',
      cell: (role) => (
        <AuditInfo 
          createdAt={role.createdAt} 
          createdBy={role.createdBy} 
        />
      ),
    },
  ];

  // Table actions
  const tableActions: TableActions<Role> = {
    onView: openViewDrawer,
    onEdit: openEditDrawer,
    onDelete: confirmDelete,
    customActions: [
      {
        label: 'Permissions',
        onClick: openPermissionsDrawer,
        icon: 'Lock', // Lock icon for permissions
      }
    ]
  };

  return (
    <div className="w-full">
      <DataTable
        title="Roles"
        description="Manage user roles and permissions."
        headerAction={
          <Button onClick={openCreateDrawer}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Role
          </Button>
        }
        data={roles}
        columns={columns}
        actions={tableActions}
        loading={loading}
        isError={error}
        onRefresh={handleRefresh}
        searchPlaceholder="Cari role..."
        searchValue={filters.search || ''}
        onSearch={handleSearch}
        emptyMessage="No roles found."
        keyExtractor={(role) => role.uuid}
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        itemsPerPage={limit}
        onItemsPerPageChange={handleLimitChange}
        showPagination={totalItems > 0}
      />

      <RoleViewDrawer
        open={drawerOpen && drawerMode === 'view'}
        onOpenChange={setDrawerOpen}
        role={selectedRole}
        onEdit={(role) => { closeDrawer(); setTimeout(() => openEditDrawer(role), 100); }}
      />

      <RoleFormDrawer
        open={drawerOpen && (drawerMode === 'create' || drawerMode === 'edit')}
        onOpenChange={setDrawerOpen}
        mode={drawerMode === 'create' || drawerMode === 'edit' ? drawerMode : null}
        form={form}
        onSubmit={handleSubmit}
        loading={submitting}
      />

      <MenuAccessDrawer
        open={permissionsDrawerOpen}
        onOpenChange={setPermissionsDrawerOpen}
        role={selectedRole}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Role"
        itemName={roleToDelete?.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}
