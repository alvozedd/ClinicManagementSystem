import React, { useState, useEffect } from 'react';
import { FaBell, FaUserClock, FaUserMd, FaCheck, FaTimes } from 'react-icons/fa';
import './QueueNotification.css';

const QueueNotification = ({ queueEntries, refreshInterval = 30000 }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [previousQueue, setPreviousQueue] = useState([]);

  // Check for queue changes when queueEntries changes
  useEffect(() => {
    if (previousQueue.length > 0) {
      checkQueueChanges(previousQueue, queueEntries);
    }
    
    // Update previous queue
    setPreviousQueue(queueEntries);
    
    // Set up auto-refresh
    const intervalId = setInterval(() => {
      // This will trigger a re-render and the above code will run
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [queueEntries, refreshInterval]);

  // Check for changes in the queue
  const checkQueueChanges = (oldQueue, newQueue) => {
    // Create maps for quick lookup
    const oldQueueMap = {};
    oldQueue.forEach(entry => {
      oldQueueMap[entry._id] = entry;
    });
    
    const newQueueMap = {};
    newQueue.forEach(entry => {
      newQueueMap[entry._id] = entry;
    });
    
    const newNotifications = [];
    
    // Check for new entries
    newQueue.forEach(entry => {
      const oldEntry = oldQueueMap[entry._id];
      
      // If entry is new
      if (!oldEntry) {
        newNotifications.push({
          id: Date.now() + '-' + entry._id,
          type: 'new',
          message: `${entry.patient_id.name} has been added to the queue`,
          timestamp: new Date(),
          entry,
          read: false
        });
      }
      // If status changed
      else if (oldEntry.status !== entry.status) {
        let message = '';
        
        switch (entry.status) {
          case 'Checked-in':
            message = `${entry.patient_id.name} has checked in`;
            break;
          case 'In-progress':
            message = `${entry.patient_id.name} is now with the doctor`;
            break;
          case 'Completed':
            message = `${entry.patient_id.name}'s appointment has been completed`;
            break;
          case 'Cancelled':
            message = `${entry.patient_id.name}'s appointment has been cancelled`;
            break;
          case 'No-show':
            message = `${entry.patient_id.name} did not show up for their appointment`;
            break;
          default:
            message = `${entry.patient_id.name}'s status changed to ${entry.status}`;
        }
        
        newNotifications.push({
          id: Date.now() + '-' + entry._id,
          type: 'status',
          message,
          timestamp: new Date(),
          entry,
          read: false
        });
      }
      // If position changed
      else if (oldEntry.queue_position !== entry.queue_position) {
        newNotifications.push({
          id: Date.now() + '-' + entry._id,
          type: 'position',
          message: `${entry.patient_id.name}'s position in the queue has changed`,
          timestamp: new Date(),
          entry,
          read: false
        });
      }
    });
    
    // Check for removed entries
    oldQueue.forEach(oldEntry => {
      if (!newQueueMap[oldEntry._id]) {
        newNotifications.push({
          id: Date.now() + '-' + oldEntry._id,
          type: 'removed',
          message: `${oldEntry.patient_id.name} has been removed from the queue`,
          timestamp: new Date(),
          entry: oldEntry,
          read: false
        });
      }
    });
    
    // Add new notifications to the list
    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev].slice(0, 50)); // Keep only the 50 most recent
      setUnreadCount(prev => prev + newNotifications.length);
      
      // Show notification sound
      playNotificationSound();
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.play();
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);
  };

  // Mark a single notification as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    
    // If less than a minute ago
    if (diff < 60000) {
      return 'Just now';
    }
    
    // If less than an hour ago
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // If less than a day ago
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Otherwise, show the date
    return new Date(timestamp).toLocaleString();
  };

  // Get icon for notification type
  const getNotificationIcon = (type, status) => {
    switch (type) {
      case 'new':
      case 'position':
        return <FaUserClock className="notification-icon" />;
      case 'status':
        switch (status) {
          case 'In-progress':
            return <FaUserMd className="notification-icon" />;
          case 'Completed':
            return <FaCheck className="notification-icon" />;
          case 'Cancelled':
          case 'No-show':
            return <FaTimes className="notification-icon" />;
          default:
            return <FaUserClock className="notification-icon" />;
        }
      case 'removed':
        return <FaTimes className="notification-icon" />;
      default:
        return <FaBell className="notification-icon" />;
    }
  };

  return (
    <div className="queue-notification">
      <div 
        className="notification-bell"
        onClick={() => {
          setShowNotifications(!showNotifications);
          if (!showNotifications) {
            markAllAsRead();
          }
        }}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>
      
      {showNotifications && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button 
              className="clear-button"
              onClick={clearNotifications}
            >
              Clear All
            </button>
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  {getNotificationIcon(notification.type, notification.entry.status)}
                  
                  <div className="notification-content">
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-time">
                      {formatTimestamp(notification.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueNotification;
