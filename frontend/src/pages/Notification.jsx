import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Notification() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Low Inventory Alert',
      message: 'This is to notify you that the following items are running low in stock:',
      date: '07/04/24',
      read: false,
    },
    {
      id: 2,
      title: 'Low Inventory Alert',
      message: 'This is to notify you that the following items are running low in stock:',
      date: '07/04/24',
      read: false,
    },
    {
      id: 3,
      title: 'Low Inventory Alert',
      message: 'This is to notify you that the following items are running low in stock:',
      date: '07/04/24',
      read: true,
    },
    {
      id: 4,
      title: 'Low Inventory Alert',
      message: 'This is to notify you that the following items are running low in stock:',
      date: '07/04/24',
      read: true,
    },
    {
      id: 4,
      title: 'Low Inventory Alert',
      message: 'This is to notify you that the following items are running low in stock:',
      date: '07/04/24',
      read: true,
    },
  ]);

  const [filter, setFilter] = useState('All');

  const handleDelete = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const filteredNotifications = filter === 'All' ? notifications : notifications.filter((n) => !n.read);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-400">You’ve {notifications.filter((n) => !n.read).length} unread notification</p>
        </div>
        <button onClick={handleMarkAllRead} className="bg-[#FF9500] px-4 py-2 rounded-md text-sm hover:bg-orange-600">
          Mark all as read
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {['All', 'Unread'].map((tab) => (
          <button key={tab} onClick={() => setFilter(tab)} className={`px-4 py-2 rounded-md text-sm ${filter === tab ? 'bg-[#FF9500] text-white' : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <p className="text-gray-400">No notifications to display.</p>
        ) : (
          filteredNotifications.map((n) => (
            <div key={n.id} className="flex justify-between items-center p-4 bg-[#2a2a2a] rounded-lg shadow hover:bg-[#3a3a3a] transition">
              <div className="flex items-center gap-4">
                <div className="bg-[#FF9500]/20 p-3 rounded-lg">
                  <i className="fa-solid fa-triangle-exclamation text-[#FF9500] text-lg"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-[#FF9500]">{n.title}</h4>
                  <p className="text-sm text-gray-300">{n.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">{n.date}</span>
                <button onClick={() => handleDelete(n.id)} className="bg-red-600 px-3 py-1 rounded-md text-sm hover:bg-red-700">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
