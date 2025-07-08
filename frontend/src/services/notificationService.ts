import React from 'react';

export interface NotificationConfig {
  enableBrowser: boolean;
  enableToast: boolean;
  enableSound: boolean;
  enableVibration: boolean;
  maxNotifications: number;
  autoHideDelay: number;
  priorityFiltering: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'trading' | 'system' | 'market' | 'alert' | 'general';
  timestamp: number;
  actions?: NotificationAction[];
  data?: any;
  persistent?: boolean;
  silent?: boolean;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: () => void;
  primary?: boolean;
}

type NotificationHandler = (notification: Notification) => void;

class NotificationService {
  private config: NotificationConfig = {
    enableBrowser: true,
    enableToast: true,
    enableSound: true,
    enableVibration: true,
    maxNotifications: 10,
    autoHideDelay: 5000,
    priorityFiltering: true
  };

  private notifications: Notification[] = [];
  private handlers: NotificationHandler[] = [];
  private permissionGranted = false;
  private soundCache = new Map<string, HTMLAudioElement>();

  constructor(config?: Partial<NotificationConfig>) {
    this.config = { ...this.config, ...config };
    this.initializeService();
  }

  private async initializeService() {
    await this.requestPermissions();
    this.preloadSounds();
    this.setupVisibilityHandler();
  }

  private async requestPermissions() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      console.log('Notification permission:', permission);
    }

    // Request persistent notification permission for PWA
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        console.log('Push subscription status:', !!subscription);
      } catch (error) {
        console.warn('Push notifications not available:', error);
      }
    }
  }

  private preloadSounds() {
    const sounds = {
      info: '/sounds/notification-info.mp3',
      success: '/sounds/notification-success.mp3',
      warning: '/sounds/notification-warning.mp3',
      error: '/sounds/notification-error.mp3',
      critical: '/sounds/notification-critical.mp3'
    };

    Object.entries(sounds).forEach(([type, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = 0.7;
      this.soundCache.set(type, audio);
    });
  }

  private setupVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden, enable more aggressive notifications
        this.config.enableBrowser = true;
      } else {
        // Page is visible, prefer in-app notifications
        this.config.enableBrowser = this.permissionGranted;
      }
    });
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldShowNotification(notification: Notification): boolean {
    if (!this.config.priorityFiltering) return true;

    // Filter based on priority and current context
    const now = Date.now();
    const recentNotifications = this.notifications.filter(
      n => now - n.timestamp < 60000 && n.category === notification.category
    );

    // Limit notifications per category per minute
    if (recentNotifications.length >= 3 && notification.priority !== 'critical') {
      return false;
    }

    // Always show critical notifications
    if (notification.priority === 'critical') {
      return true;
    }

    // Check if similar notification exists
    const similar = this.notifications.find(
      n => n.title === notification.title && 
           n.category === notification.category &&
           now - n.timestamp < 30000
    );

    return !similar;
  }

  private async showBrowserNotification(notification: Notification) {
    if (!this.config.enableBrowser || !this.permissionGranted) return;

    try {
             const browserNotif = new Notification(notification.title, {
         body: notification.message,
         icon: '/logo-192.png',
         badge: '/logo-192.png',
         tag: notification.category,
         requireInteraction: notification.persistent || notification.priority === 'critical',
         silent: notification.silent,
         data: notification.data
       });

      browserNotif.onclick = () => {
        window.focus();
        browserNotif.close();
        this.handleNotificationClick(notification);
      };

      // Auto-close non-persistent notifications
      if (!notification.persistent && notification.priority !== 'critical') {
        setTimeout(() => {
          browserNotif.close();
        }, this.config.autoHideDelay);
      }

    } catch (error) {
      console.error('Failed to show browser notification:', error);
    }
  }

  private playSound(type: string) {
    if (!this.config.enableSound) return;

    const audio = this.soundCache.get(type);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.warn('Failed to play notification sound:', error);
      });
    }
  }

  private vibrate(pattern: number[]) {
    if (!this.config.enableVibration || !navigator.vibrate) return;

    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn('Vibration not supported:', error);
    }
  }

  private getVibrationPattern(type: string): number[] {
    const patterns = {
      info: [200],
      success: [200, 100, 200],
      warning: [300, 100, 300],
      error: [500, 100, 500, 100, 500],
      critical: [1000, 200, 1000, 200, 1000]
    };
    return patterns[type as keyof typeof patterns] || [200];
  }

  private handleNotificationClick(notification: Notification) {
    // Emit click event to handlers
    this.handlers.forEach(handler => handler(notification));

    // Execute default action if available
    const primaryAction = notification.actions?.find(a => a.primary);
    if (primaryAction) {
      primaryAction.action();
    }
  }

  private cleanupOldNotifications() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    this.notifications = this.notifications.filter(
      notification => now - notification.timestamp < maxAge
    );

    // Limit total notifications
    if (this.notifications.length > this.config.maxNotifications) {
      this.notifications = this.notifications
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, this.config.maxNotifications);
    }
  }

  async show(notificationData: Omit<Notification, 'id' | 'timestamp'>): Promise<string> {
    const notification: Notification = {
      ...notificationData,
      id: this.generateId(),
      timestamp: Date.now()
    };

    // Check if we should show this notification
    if (!this.shouldShowNotification(notification)) {
      console.debug('Notification filtered out:', notification.title);
      return notification.id;
    }

    // Add to internal list
    this.notifications.unshift(notification);
    this.cleanupOldNotifications();

    // Show browser notification if page is hidden or user prefers it
    if (document.hidden || this.config.enableBrowser) {
      await this.showBrowserNotification(notification);
    }

    // Play sound
    if (!notification.silent) {
      this.playSound(notification.type);
    }

    // Vibrate
    if (!notification.silent) {
      this.vibrate(this.getVibrationPattern(notification.type));
    }

    // Notify handlers (for toast notifications, etc.)
    if (this.config.enableToast) {
      this.handlers.forEach(handler => handler(notification));
    }

    console.log('Notification shown:', notification.title);
    return notification.id;
  }

  // Convenience methods for different types
  async info(title: string, message: string, options?: Partial<Notification>) {
    return this.show({
      title,
      message,
      type: 'info',
      priority: 'medium',
      category: 'general',
      ...options
    });
  }

  async success(title: string, message: string, options?: Partial<Notification>) {
    return this.show({
      title,
      message,
      type: 'success',
      priority: 'medium',
      category: 'general',
      ...options
    });
  }

  async warning(title: string, message: string, options?: Partial<Notification>) {
    return this.show({
      title,
      message,
      type: 'warning',
      priority: 'high',
      category: 'alert',
      ...options
    });
  }

  async error(title: string, message: string, options?: Partial<Notification>) {
    return this.show({
      title,
      message,
      type: 'error',
      priority: 'high',
      category: 'alert',
      ...options
    });
  }

  async critical(title: string, message: string, options?: Partial<Notification>) {
    return this.show({
      title,
      message,
      type: 'critical',
      priority: 'critical',
      category: 'alert',
      persistent: true,
      ...options
    });
  }

  // Trading-specific notifications
  async tradingAlert(title: string, message: string, data?: any) {
    return this.show({
      title,
      message,
      type: 'warning',
      priority: 'high',
      category: 'trading',
      data,
      actions: [
        {
          id: 'view',
          label: 'View Details',
          action: () => console.log('View trading details:', data),
          primary: true
        }
      ]
    });
  }

  async marketUpdate(symbol: string, change: number, price: number) {
    const type = change > 0 ? 'success' : change < 0 ? 'warning' : 'info';
    const direction = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
    
    return this.show({
      title: `${symbol} ${direction}`,
      message: `Price: $${price.toFixed(2)} (${change > 0 ? '+' : ''}${change.toFixed(2)}%)`,
      type,
      priority: Math.abs(change) > 5 ? 'high' : 'medium',
      category: 'market',
      data: { symbol, change, price }
    });
  }

  // Management methods
  dismiss(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  dismissAll() {
    this.notifications = [];
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.length;
  }

  onNotification(handler: NotificationHandler): () => void {
    this.handlers.push(handler);
    return () => {
      const index = this.handlers.indexOf(handler);
      if (index > -1) {
        this.handlers.splice(index, 1);
      }
    };
  }

  updateConfig(newConfig: Partial<NotificationConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): NotificationConfig {
    return { ...this.config };
  }

  // Test notification for debugging
  async test() {
    await this.info(
      'Test Notification',
      'This is a test notification to verify the system is working correctly.',
      { category: 'system' }
    );
  }
}

// Singleton instance
export const notificationService = new NotificationService();

// React hook for using notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  React.useEffect(() => {
    const unsubscribe = notificationService.onNotification((notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
    });

    // Initialize with existing notifications
    setNotifications(notificationService.getNotifications());

    return unsubscribe;
  }, []);

  return {
    notifications,
    show: notificationService.show.bind(notificationService),
    info: notificationService.info.bind(notificationService),
    success: notificationService.success.bind(notificationService),
    warning: notificationService.warning.bind(notificationService),
    error: notificationService.error.bind(notificationService),
    critical: notificationService.critical.bind(notificationService),
    tradingAlert: notificationService.tradingAlert.bind(notificationService),
    marketUpdate: notificationService.marketUpdate.bind(notificationService),
    dismiss: notificationService.dismiss.bind(notificationService),
    dismissAll: notificationService.dismissAll.bind(notificationService),
    test: notificationService.test.bind(notificationService)
  };
};

export default NotificationService; 