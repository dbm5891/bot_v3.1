import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { removeNotification } from '../store/slices/uiSlice';
import { Alert } from '../components/ui/alert';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const NotificationsManager = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state: RootState) => state.ui);

  // Auto-remove notifications after 6 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        dispatch(removeNotification(notifications[0].id));
      }, 6000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [notifications, dispatch]);

  const handleClose = (id: string) => {
    dispatch(removeNotification(id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          variant={notification.type === 'error' ? 'destructive' : notification.type === 'success' ? 'default' : 'secondary'}
          className={cn(
            'shadow-lg w-96 flex items-center justify-between',
            'animate-slide-in-from-right animate-fade-in',
            'hover:shadow-xl transition-shadow'
          )}
        >
          <div className="flex items-center gap-2">
            {getIcon(notification.type)}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            className="ml-4 p-1 rounded-full hover:bg-background/10 transition-colors"
            onClick={() => handleClose(notification.id)}
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </Alert>
      ))}
    </div>
  );
};

export default NotificationsManager;