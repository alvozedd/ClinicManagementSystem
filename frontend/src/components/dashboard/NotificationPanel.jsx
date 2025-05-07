import { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaCalendarAlt, FaExclamationCircle, FaRegBell } from 'react-icons/fa';
import apiService from '../../utils/apiService';

const NotificationPanel = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await apiService.getNotifications();
        setNotifications(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications(
        notifications.map((notification) =>
          notification._id === id ? { ...notification, is_read: true } : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(
        notifications.map((notification) => ({ ...notification, is_read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment_created':
        return <FaCalendarAlt className="text-blue-500" />;
      case 'appointment_updated':
        return <FaCalendarAlt className="text-green-500" />;
      case 'appointment_cancelled':
        return <FaCalendarAlt className="text-red-500" />;
      case 'queue_updated':
        return <FaExclamationCircle className="text-yellow-500" />;
      default:
        return <FaRegBell className="text-gray-500" />;
    }
  };

  return (
    <div className="notification-panel fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-800 shadow-lg z-50 overflow-hidden flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Notifications</h2>
        <div className="flex items-center space-x-2">
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Mark all as read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center p-4 text-red-500 dark:text-red-400">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-8 text-gray-500 dark:text-gray-400">
            <FaRegBell className="mx-auto text-4xl mb-2 opacity-30" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-3 rounded-lg transition-colors ${
                  notification.is_read
                    ? 'bg-gray-50 dark:bg-gray-800'
                    : 'bg-blue-50 dark:bg-blue-900/30'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-3">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      notification.is_read
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="ml-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Mark as read"
                    >
                      <FaCheck />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
