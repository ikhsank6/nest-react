import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userService, type User } from '@/services/user.service';
import { roleService, type Role } from '@/services/role.service';
import { DataTable, type Column, type RowAction } from '@/components/ui/data-table';
import { FormSheet, ViewSheet, FieldDisplay } from '@/components/ui/form-sheet';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { userFormSchema, type UserFormData } from '@/lib/validations';

type DrawerMode = 'create' | 'edit' | 'view' | null;

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const users = await userService.getAll();
      setUsers(users);
    } catch (error) {
      toast.error('Gagal mengambil data user');
      setUsers([]);
    } finally {
      setLoading(false);
    }
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
    setShowPassword(false);
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
    setShowPassword(false);
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

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

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
        <Badge variant="secondary" className="font-normal capitalize">
          {user.role?.name || 'User'}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (user) => (
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-muted'}`} />
          <span className="text-sm">{user.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      headerClassName: 'hidden md:table-cell',
      className: 'hidden md:table-cell text-muted-foreground text-sm',
      cell: (user) => new Date(user.createdAt).toLocaleDateString(),
    },
  ];

  // Table actions
  const actions: RowAction<User>[] = [
    {
      label: 'View',
      icon: <Eye className="mr-2 h-3.5 w-3.5" />,
      onClick: openViewDrawer,
    },
    {
      label: 'Edit',
      icon: <Edit2 className="mr-2 h-3.5 w-3.5" />,
      onClick: openEditDrawer,
    },
    {
      label: 'Delete',
      icon: <Trash2 className="mr-2 h-3.5 w-3.5" />,
      onClick: confirmDelete,
      variant: 'destructive',
      separator: true,
    },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage your user accounts and permissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-8" onClick={openCreateDrawer}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        actions={actions}
        loading={loading}
        searchPlaceholder="Filter users..."
        searchValue={search}
        onSearch={setSearch}
        emptyMessage="No users found."
        keyExtractor={(user) => user.uuid}
        totalItems={users.length}
        showPagination={filteredUsers.length > 0}
      />

      {/* View Drawer */}
      {drawerMode === 'view' && selectedUser && (
        <ViewSheet
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title="Detail User"
          description="Informasi detail user."
          onEdit={() => { closeDrawer(); setTimeout(() => openEditDrawer(selectedUser), 100); }}
        >
          <FieldDisplay label="Nama" value={selectedUser.name} />
          <FieldDisplay label="Email" value={selectedUser.email} />
          <FieldDisplay label="Role" value={selectedUser.role?.name} />
          <FieldDisplay 
            label="Status" 
            value={
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${selectedUser.isActive ? 'bg-green-500' : 'bg-muted'}`} />
                <span>{selectedUser.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            } 
          />
          <FieldDisplay label="Dibuat Pada" value={new Date(selectedUser.createdAt).toLocaleString()} />
          <FieldDisplay label="Terakhir Update" value={new Date(selectedUser.updatedAt).toLocaleString()} />
        </ViewSheet>
      )}

      {/* Create/Edit Form Drawer */}
      {(drawerMode === 'create' || drawerMode === 'edit') && (
        <FormSheet
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title={drawerMode === 'create' ? 'Tambah User Baru' : 'Edit User'}
          description={drawerMode === 'create' ? 'Isi form di bawah untuk membuat user baru.' : 'Ubah data user sesuai kebutuhan.'}
          onSubmit={form.handleSubmit(handleSubmit)}
          submitLabel={drawerMode === 'create' ? 'Simpan' : 'Update'}
          loading={submitting}
        >
          <Form {...form}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama" {...field} disabled={submitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Masukkan email" {...field} disabled={submitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password {drawerMode === 'create' && <span className="text-destructive">*</span>}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder={drawerMode === 'edit' ? '••••••••' : 'Masukkan password'} 
                          {...field} 
                          disabled={submitting} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    {drawerMode === 'edit' && (
                      <FormDescription>Kosongkan jika tidak ingin mengubah password</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roleUuid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={submitting}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.uuid} value={role.uuid}>
                            {role.name}
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
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Status Aktif</FormLabel>
                      <FormDescription>
                        User aktif dapat login ke sistem
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={submitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </FormSheet>
      )}

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
