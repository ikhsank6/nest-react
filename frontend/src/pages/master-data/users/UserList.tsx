import { useState, useEffect, useCallback } from 'react';
import { useRequestGuard } from '@/hooks/useRequestGuard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userService, type User } from '@/services/user.service';
import { roleService, type Role } from '@/services/role.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Mail } from 'lucide-react';
import { showSuccess, showError } from '@/lib/utils';
import { userFormSchema, type UserFormData } from '@/lib/validations';
import { useTable } from '@/hooks/useTable';
import { UserViewDrawer } from '@/components/master-data/users/UserViewDrawer';
import { UserFormDrawer } from '@/components/master-data/users/UserFormDrawer';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDateTime } from '@/lib/utils';
import { AuditInfo } from '@/components/ui/audit-info';

type DrawerMode = 'create' | 'edit' | 'view' | null;

export default function UserList() {
  // Use table state from store
  const {
    data: users,
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
    refresh: fetchUsers,
  } = useTable<User>('users', useCallback((p, l, f) => userService.getAll(p, l, f), []));
  
  // Roles state remains local as it's not part of the table store
  const [roles, setRoles] = useState<Role[]>([]);
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { withRequestGuard } = useRequestGuard();
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Single form for both create and edit
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      roleUuid: '',
      isActive: false,
    },
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSearch = (val: string) => {
    setFilters({ search: val || undefined });
  };

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setFilters({ isActive: undefined });
    } else {
      setFilters({ isActive: status === 'active' });
    }
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

  const fetchRoles = withRequestGuard(async () => {
    try {
      const response = await roleService.getAll();
      // Extract the data array from the paginated response
      setRoles(response?.data || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  });

  const openCreateDrawer = () => {
    form.reset({
      name: '',
      email: '',
      roleUuid: '',
      isActive: false,
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

  const handleSubmit = withRequestGuard(async (data: UserFormData) => {
    setSubmitting(true);

    try {
      const submitData: any = { ...data };
      if (!submitData.password) {
        delete submitData.password;
      }

      if (drawerMode === 'create') {
        await userService.create(submitData);
        showSuccess(data.isActive ? 'User berhasil dibuat' : 'User berhasil dibuat. Email verifikasi telah dikirim.');
      } else if (drawerMode === 'edit' && selectedUser) {
        await userService.update(selectedUser.uuid, submitData);
        showSuccess('User berhasil diupdate');
      }
      
      closeDrawer();
      fetchUsers();
    } catch (error: any) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  });

  const handleDelete = withRequestGuard(async () => {
    if (!userToDelete) return;
    
    try {
      await userService.delete(userToDelete.uuid);
      showSuccess('User berhasil dihapus');
      fetchUsers();
    } catch (error) {
      showError(error);
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  });

  const confirmDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleResendVerification = withRequestGuard(async (user: User) => {
    try {
      await userService.resendVerification(user.uuid);
      showSuccess(`Email verifikasi telah dikirim ke ${user.email}`);
    } catch (error: any) {
      showError(error);
    }
  });

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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-start gap-1 cursor-help">
                <div className="flex items-center gap-2 mb-0.5">
                  <div className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                  <span className="text-sm font-medium">{user.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                {!user.verifiedAt && (
                  <Badge variant="outline" className="text-[10px] h-5 py-0 px-2 text-amber-500 border-amber-500/50 bg-amber-500/10 whitespace-nowrap">
                    Belum Verifikasi
                  </Badge>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {user.verifiedAt 
                ? `Terverifikasi: ${formatDateTime(user.verifiedAt)}`
                : 'Email belum diverifikasi'
              }
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      cell: (user) => (
        <AuditInfo 
          createdAt={user.createdAt} 
          createdBy={user.createdBy} 
        />
      ),
    },
  ];

  // Table actions with dynamic custom action for resend verification
  const getTableActions = (): TableActions<User> => ({
    onView: openViewDrawer,
    onEdit: openEditDrawer,
    onDelete: confirmDelete,
    customActions: [
      {
        label: 'Kirim Ulang Email Verifikasi',
        onClick: handleResendVerification,
        icon: <Mail className="h-4 w-4" />,
        variant: 'ghost',
        className: 'hover:text-blue-500',
        // This will be handled by conditional rendering in the table
        showCondition: (user: User) => !user.verifiedAt,
      },
    ],
  });

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
        actions={getTableActions()}
        loading={loading}
        isError={error}
        onRefresh={handleRefresh}
        searchPlaceholder="Search..."
        searchValue={filters.search || ''}
        onSearch={handleSearch}
        statusFilter={{
          value: filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive',
          onChange: handleStatusFilter,
          options: [
            { value: 'all', label: 'Semua Status' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ],
        }}
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
