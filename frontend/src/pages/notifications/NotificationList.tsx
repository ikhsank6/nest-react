import { useState, useCallback } from 'react';
import { useRequestGuard } from '@/hooks/useRequestGuard';
import { notificationService, NotificationType } from '@/services/notification.service';
import type { Notification } from '@/services/notification.service';
import { DataTable, type Column, type TableActions } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Bell, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { showSuccess, showError } from '@/lib/utils';
import { useTable } from '@/hooks/useTable';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { DeleteDialog } from '@/components/ui/delete-dialog';

export default function NotificationList() {
  const navigate = useNavigate();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { withRequestGuard } = useRequestGuard();
  
  const {
    data: notifications,
    loading,
    filters,
    page,
    limit,
    totalPages,
    totalItems,
    setPage,
    setLimit,
    setFilters,
    refresh,
  } = useTable<Notification>('notifications', useCallback((p, l, f) => {
    return notificationService.getAll(p, l, unreadOnly, f.search);
  }, [unreadOnly]));

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);

  const columns: Column<Notification>[] = [
    {
      key: 'type',
      header: 'Tipe',
      cell: (notification) => {
        const getIcon = (type: NotificationType) => {
          switch (type) {
            case NotificationType.SUCCESS:
              return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case NotificationType.WARNING:
              return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case NotificationType.ERROR:
              return <XCircle className="h-4 w-4 text-red-500" />;
            default:
              return <Info className="h-4 w-4 text-blue-500" />;
          }
        };
        return (
          <div className="flex items-center justify-center">
            {getIcon(notification.type)}
          </div>
        );
      },
      headerClassName: "w-[80px] text-center",
    },
    {
      key: 'message',
      header: 'Pesan',
      cell: (notification) => (
        <div className={cn(
          "max-w-[500px] truncate",
          !notification.isRead ? "font-semibold text-foreground" : "text-muted-foreground"
        )}>
          {notification.message}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Waktu',
      cell: (notification) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDistanceToNow(new Date(notification.createdAt), { 
            addSuffix: true,
            locale: id 
          })}
        </span>
      ),
    },
    {
      key: 'isRead',
      header: 'Status',
      cell: (notification) => (
        <Badge variant={notification.isRead ? 'secondary' : 'default'} className="whitespace-nowrap">
          {notification.isRead ? 'Sudah Dibaca' : 'Belum Dibaca'}
        </Badge>
      ),
    },
  ];

  const actions: TableActions<Notification> = {
    onView: (notification) => {
      if (!notification.isRead) {
        handleMarkAsRead(notification.uuid, false);
      }
      if (notification.detailUrl) {
        navigate(notification.detailUrl);
      }
    },
    onDelete: (notification) => {
      setNotificationToDelete(notification);
      setDeleteDialogOpen(true);
    },
    customActions: [
      {
        label: 'Tandai Dibaca',
        icon: <Check className="h-4 w-4" />,
        onClick: (notification) => handleMarkAsRead(notification.uuid),
        showCondition: (notification) => !notification.isRead,
      }
    ]
  };

  const handleMarkAsRead = withRequestGuard(async (uuid: string, showToast = true) => {
    try {
      await notificationService.markAsRead([uuid]);
      refresh();
      if (showToast) {
        showSuccess('Notifikasi ditandai sebagai dibaca');
      }
    } catch (error) {
      if (showToast) {
        showError(error);
      }
    }
  });

  const handleMarkAllAsRead = withRequestGuard(async () => {
    try {
      await notificationService.markAllAsRead();
      refresh();
      showSuccess('Semua notifikasi ditandai sebagai dibaca');
    } catch (error) {
      showError(error);
    }
  });

  const handleDelete = withRequestGuard(async () => {
    if (!notificationToDelete) return;
    try {
      await notificationService.delete(notificationToDelete.uuid);
      refresh();
      showSuccess('Notifikasi berhasil dihapus');
      setDeleteDialogOpen(false);
    } catch (error) {
      showError(error);
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Semua Notifikasi</h2>
          <p className="text-muted-foreground">
            Kelola dan lihat semua riwayat notifikasi Anda.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant={unreadOnly ? "default" : "outline"} 
            size="sm"
            onClick={() => setUnreadOnly(!unreadOnly)}
            className="h-9"
          >
            {unreadOnly ? "Menampilkan Belum Dibaca" : "Tampilkan Semua"}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleMarkAllAsRead} disabled={loading}>
              <Check className="mr-2 h-4 w-4" />
              Tandai Semua Dibaca
            </Button>
            <Button onClick={() => refresh()}>
              <Bell className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        title="Daftar Notifikasi"
        description="Menampilkan semua notifikasi sistem untuk role Anda."
        columns={columns}
        data={notifications || []}
        loading={loading}
        onSearch={(val) => setFilters({ search: val || undefined })}
        searchValue={filters.search || ''}
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
        itemsPerPage={limit}
        onItemsPerPageChange={setLimit}
        actions={actions}
        keyExtractor={(item) => item.uuid}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Hapus Notifikasi"
        description="Apakah Anda yakin ingin menghapus notifikasi ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}
