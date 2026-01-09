export class NotificationResource {
  uuid: string;
  message: string;
  detailUrl: string | null;
  referenceId: string | null;
  type: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;

  constructor(notification: any) {
    this.uuid = notification.uuid;
    this.message = notification.message;
    this.detailUrl = notification.detailUrl || null;
    this.referenceId = notification.referenceId || null;
    this.type = notification.type;
    this.isRead = notification.isRead;
    this.readAt = notification.readAt?.toISOString?.() || notification.readAt || null;
    this.createdAt = notification.createdAt?.toISOString?.() || notification.createdAt;
  }

  static collection(notifications: any[]): NotificationResource[] {
    return notifications.map((n) => new NotificationResource(n));
  }

  toJSON() {
    return {
      uuid: this.uuid,
      message: this.message,
      detailUrl: this.detailUrl,
      referenceId: this.referenceId,
      type: this.type,
      isRead: this.isRead,
      readAt: this.readAt,
      createdAt: this.createdAt,
    };
  }
}
