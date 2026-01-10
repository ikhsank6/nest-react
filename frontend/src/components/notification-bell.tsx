import { useEffect, useState } from 'react';
import { Bell, Trash2, Info, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { notificationService, NotificationType } from '@/services/notification.service';
import type { Notification } from '@/services/notification.service';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn, showSuccess, showError } from '@/lib/utils';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getAll(1, 10, true);
      setNotifications(response.data);
      const countRes = await notificationService.getUnreadCount();
      setUnreadCount(countRes.count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 1 minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (uuid: string) => {
    try {
      await notificationService.markAsRead([uuid]);
      setNotifications(prev => 
        prev.map(n => n.uuid === uuid ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      showError(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showSuccess('Semua notifikasi ditandai sebagai dibaca');
    } catch (error) {
      showError(error);
    }
  };

  const handleDelete = async (uuid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.delete(uuid);
      setNotifications(prev => prev.filter(n => n.uuid !== uuid));
      if (!notifications.find(n => n.uuid === uuid)?.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      showSuccess('Notifikasi dihapus');
    } catch (error) {
      showError(error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.uuid);
    }
    if (notification.detailUrl) {
      navigate(notification.detailUrl);
    }
  };

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
    <DropdownMenu onOpenChange={(open) => open && fetchNotifications()}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group">
          <Bell className="h-5 w-5 transition-all group-hover:scale-110" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] animate-in zoom-in"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0 shadow-2xl overflow-hidden border-none bg-card/95 backdrop-blur-md">
        <div className="flex flex-col h-[500px]">
          <div className="p-4 border-b flex items-center justify-between bg-muted/30">
            <div>
              <h3 className="font-bold text-lg leading-none">Notifikasi</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Anda memiliki {unreadCount} pesan belum dibaca
              </p>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                className="text-xs h-8 text-primary hover:text-primary hover:bg-primary/10"
              >
                Tandai semua dibaca
              </Button>
            )}
          </div>
          
          <ScrollArea className="flex-1">
            <div className="flex flex-col shrink-0">
              {loading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                  <p className="text-sm text-muted-foreground">Memuat notifikasi...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3 bg-muted/5">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Bell className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <div>
                    <p className="font-semibold">Belum ada notifikasi</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Semua aktivitas terbaru akan muncul di sini
                    </p>
                  </div>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.uuid}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "group p-4 border-b transition-all cursor-pointer hover:bg-muted/50 relative flex gap-3 items-start",
                      !notification.isRead && "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <div className="mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className={cn(
                        "text-sm leading-tight",
                        !notification.isRead ? "font-semibold text-foreground" : "text-muted-foreground"
                      )}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {formatDistanceToNow(new Date(notification.createdAt), { 
                            addSuffix: true,
                            locale: id 
                          })}
                        </span>
                        {!notification.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive shrink-0"
                      onClick={(e) => handleDelete(notification.uuid, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          <DropdownMenuSeparator className="m-0" />
          <div className="p-2 bg-muted/20">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs font-medium hover:bg-primary/5 hover:text-primary transition-colors"
              onClick={() => navigate('/notifications')}
            >
              Lihat Semua Notifikasi
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
