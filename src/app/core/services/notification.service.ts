import { Injectable, signal, computed } from '@angular/core';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'stock' | 'order' | 'info' | 'alert' | 'user';
  timestamp: Date;
  isRead: boolean;
  avatar?: string;
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSignal = signal<AppNotification[]>([
    {
      id: '1',
      title: 'New Order Received',
      message: 'You have a new order #ORD-1234 from John Doe.',
      type: 'order',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
      isRead: false,
      category: 'Sales'
    },
    {
      id: '2',
      title: 'Low Stock Alert',
      message: 'Product "MacBook Pro M3" is running low on stock (only 2 left).',
      type: 'stock',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isRead: false,
      category: 'Inventory'
    },
    {
      id: '3',
      title: 'New User Registered',
      message: 'Sarah Connor has just joined the platform.',
      type: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isRead: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      category: 'Users'
    },
    {
      id: '4',
      title: 'System Update',
      message: 'Platform maintenance scheduled for tonight at 2:00 AM UTC.',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      isRead: true,
      category: 'System'
    }
  ]);

  notifications = computed(() => this.notificationsSignal());
  unreadCount = computed(() => this.notificationsSignal().filter(n => !n.isRead).length);

  addNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) {
    const newNotification: AppNotification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      isRead: false
    };
    this.notificationsSignal.update(n => [newNotification, ...n]);
  }

  markAsRead(id: string) {
    this.notificationsSignal.update(notifications =>
      notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }

  markAllAsRead() {
    this.notificationsSignal.update(notifications =>
      notifications.map(n => ({ ...n, isRead: true }))
    );
  }

  clearAll() {
    this.notificationsSignal.set([]);
  }
}
