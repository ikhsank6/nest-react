import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userService, type User } from '@/services/user.service';
import { roleService, type Role } from '@/services/role.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { userFormSchema, type UserFormData } from '@/lib/validations';
import { useTable } from '@/hooks/useTable';
import { UserViewDrawer } from '@/components/users/UserViewDrawer';
import { UserFormDrawer } from '@/components/users/UserFormDrawer';
import { DeleteDialog } from '@/components/ui/delete-dialog';

type DrawerMode = 'create' | 'edit' | 'view' | null;

export default function UserList() {
  // Use table state from store
  const {
    data: users,
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
    refresh: fetchUsers,
  } = useTable<User>('users', useCallback((p, l, s) => userService.getAll(p, l, s), []));
  
  // Roles state remains local as it's not part of the table store
  const [roles, setRoles] = useState<Role[]>([]);
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Single form for both create and edit
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      roleUuid: '',
      isActive: true,
    },
  });

  useEffect(() => {
    fetchRoles();
  }, []);

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
    fetchUsers();
    fetchRoles();
  };

  const fetchRoles = async () => {
    try {
      const roles = await roleService.getAll();
      setRoles(roles);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const openCreateDrawer = () => {
    form.reset({
      name: '',
      email: '',
      password: '',
      roleUuid: '',
      isActive: true,
    });
    setSelectedUser(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEditDrawer = (user: User) => {
    setSelectedUser(user);
    form.reset({
      name: user.name,
      email: user.email,
      password: '',
      roleUuid: user.role?.uuid || '',
      isActive: user.isActive,
    });
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const openViewDrawer = (user: User) => {
    setSelectedUser(user);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerMode(null);
    setSelectedUser(null);
  };

  const handleSubmit = async (data: UserFormData) => {
    // Custom validation for create mode
    if (drawerMode === 'create' && (!data.password || data.password.length < 6)) {
      form.setError('password', { message: 'Password minimal 6 karakter' });
      return;
    }

    setSubmitting(true);

    try {
      if (drawerMode === 'create') {
        await userService.create(data);
        toast.success('User berhasil dibuat');
      } else if (drawerMode === 'edit' && selectedUser) {
        const updateData: any = { ...data };
        if (!updateData.password) {
          delete updateData.password;
        }
        await userService.update(selectedUser.uuid, updateData);
        toast.success('User berhasil diupdate');
      }
      
      closeDrawer();
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await userService.delete(userToDelete.uuid);
      toast.success('User berhasil dihapus');
      fetchUsers();
    } catch (error) {
      toast.error('Gagal menghapus user');
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const confirmDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Table columns
  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'User',
      cell: (user) => (
        <div className="flex flex-col">
          <span className="font-medium">{user.name}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      cell: (user) => (
        <Badge variant="outline" className="font-normal capitalize">
          {user.role?.name || 'User'}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (user) => (
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-muted-foreground'}`} />
          <span className="text-sm">{user.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      cell: (user) => (
        <span className="text-muted-foreground">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Table actions
  const tableActions: TableActions<User> = {
    onView: openViewDrawer,
    onEdit: openEditDrawer,
    onDelete: confirmDelete,
  };

  return (
    <div className="w-full">
      {/* All-in-one Card Table */}
      <DataTable
        title="Users"
        description="Manage your user accounts and permissions."
        headerAction={
          <Button onClick={openCreateDrawer}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah User
          </Button>
        }
        data={users}
        columns={columns}
        actions={tableActions}
        loading={loading}
        isError={error}
        onRefresh={handleRefresh}
        searchPlaceholder="Search..."
        searchValue={search}
        onSearch={handleSearch}
        emptyMessage="No users found."
        keyExtractor={(user) => user.uuid}
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        itemsPerPage={limit}
        onItemsPerPageChange={handleLimitChange}
        showPagination={totalItems > 0}
      />

      {/* View Drawer */}
      <UserViewDrawer
        open={drawerOpen && drawerMode === 'view'}
        onOpenChange={setDrawerOpen}
        user={selectedUser}
        onEdit={(user) => { closeDrawer(); setTimeout(() => openEditDrawer(user), 100); }}
      />

      {/* Create/Edit Form Drawer */}
      <UserFormDrawer
        open={drawerOpen && (drawerMode === 'create' || drawerMode === 'edit')}
        onOpenChange={setDrawerOpen}
        mode={drawerMode === 'create' || drawerMode === 'edit' ? drawerMode : null}
        form={form}
        onSubmit={handleSubmit}
        loading={submitting}
        roles={roles}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus User"
        itemName={userToDelete?.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}
