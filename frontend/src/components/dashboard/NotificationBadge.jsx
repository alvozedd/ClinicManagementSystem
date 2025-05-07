import { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import apiService from '../../utils/apiService';

const NotificationBadge = ({ onClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const data = await apiService.getUnreadNotificationCount();
        setUnreadCount(data.count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCount();

    // Set up polling to check for new notifications every 30 seconds
    const intervalId = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
      aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
    >
      <FaBell className="text-xl" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBadge;
