import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';

export const NotificationsPage = ({ setActiveTab, setSelectedComplaintId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={22} color="#0f2b5c" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f2b5c' }}>
            System Alerts & Grievance Notifications
          </h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
          Lifecycle alerts, status updates, overlap detections, and document reminders
        </p>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            Loading alerts...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            No notifications on record.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map((n) => (
              <div
                key={n._id}
                style={{
                  padding: '1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: n.read ? '#ffffff' : '#f8fafc',
                  border: `1px solid ${n.read ? '#e2e8f0' : '#bfdbfe'}`,
                  borderLeft: `4px solid ${n.type === 'WARNING' ? '#f59e0b' : n.type === 'SUCCESS' ? '#059669' : '#2563eb'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{n.title}</span>
                    {n.complaintId && (
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{n.complaintId}</span>
                    )}
                    {!n.read && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
                    )}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '0.25rem' }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!n.read && (
                    <button
                      onClick={() => handleMarkAsRead(n._id)}
                      className="btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                    >
                      Mark Read
                    </button>
                  )}
                  {n.complaintId && n.complaintId !== 'SYSTEM' && (
                    <button
                      onClick={() => {
                        setSelectedComplaintId(n.complaintId);
                        setActiveTab('complaint-detail');
                      }}
                      className="btn-primary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                    >
                      Open Case
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
