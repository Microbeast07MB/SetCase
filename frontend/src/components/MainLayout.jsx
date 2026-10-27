import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Layers,
  LayoutDashboard,
  FilePlus,
  Files,
  Inbox,
  GitMerge,
  Network,
  BarChart3,
  MessageSquareQuote,
  Bell,
  LogOut,
  User,
  Search,
  CheckCircle,
  Clock,
  Shield,
  AlertTriangle
} from 'lucide-react';

export const MainLayout = ({ activeTab, setActiveTab, children }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifs = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.notifications.filter(n => !n.read).length);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  // Build navigation items based on user role
  const isStudent = user?.role === 'STUDENT';
  const isOfficer = user?.role === 'OFFICER';
  const isSupervisor = user?.role === 'SUPERVISOR';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['STUDENT', 'OFFICER', 'SUPERVISOR'] },
    // Student items
    { id: 'submit', label: 'Lodge Grievance', icon: FilePlus, roles: ['STUDENT'] },
    { id: 'my-complaints', label: 'My Complaints', icon: Files, roles: ['STUDENT'] },
    // Officer items
    { id: 'officer-cases', label: 'Assigned Cases', icon: Inbox, roles: ['OFFICER'] },
    { id: 'smart-overlap', label: 'AI Overlap Matching', icon: GitMerge, roles: ['OFFICER', 'SUPERVISOR'] },
    // Supervisor items
    { id: 'bureau-coordination', label: 'Bureau Coordination', icon: Network, roles: ['SUPERVISOR'] },
    { id: 'analytics', label: 'Institutional Analytics', icon: BarChart3, roles: ['SUPERVISOR'] },
    // Universal Feedback & Audit
    { id: 'resolution-reviews', label: 'Resolution Reviews', icon: MessageSquareQuote, roles: ['STUDENT', 'OFFICER', 'SUPERVISOR'] },
    { id: 'audit-logs', label: 'Compliance Audit Trail', icon: Shield, roles: ['SUPERVISOR'] },
    { id: 'notifications-page', label: 'Notifications', icon: Bell, roles: ['STUDENT', 'OFFICER', 'SUPERVISOR'] }
  ].filter(item => item.roles.includes(user?.role));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#0a1b3a', color: '#ffffff', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1e293b' }}>
        {/* Brand */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '0.02em', color: '#ffffff' }}>SetuCase</div>
            <div style={{ fontSize: '0.7rem', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AICTE Portal</div>
          </div>
        </div>

        {/* Current Persona Badge */}
        <div style={{ margin: '1rem 1.25rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Active Role</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>{user?.role}</span>
            <span className="badge badge-resolved" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Verified</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name}
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 1rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s, color 0.15s'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon size={18} color={isActive ? '#ffffff' : '#94a3b8'} />
                <span>{item.label}</span>
                {item.id === 'notifications-page' && unreadCount > 0 && (
                  <span style={{ marginLeft: 'auto', backgroundColor: '#ef4444', color: '#ffffff', borderRadius: '9999px', fontSize: '0.7rem', padding: '0.1rem 0.45rem', fontWeight: 700 }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Help / Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.6rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.375rem',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Navbar */}
        <header style={{ height: '64px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f2b5c' }}>
              {navItems.find(n => n.id === activeTab)?.label || 'Overview'}
            </div>
            <div style={{ height: '18px', width: '1px', backgroundColor: '#e2e8f0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.8rem' }}>
              <span>Institution Focus:</span>
              <strong style={{ color: '#0f172a' }}>ABC Institute of Technology</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Notification Bell with Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <Bell size={18} color="#475569" />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#dc2626', color: '#ffffff', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="card" style={{ position: 'absolute', right: 0, top: '48px', width: '320px', zIndex: 100, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>System Alerts</span>
                    <button onClick={() => { setActiveTab('notifications-page'); setShowNotifMenu(false); }} style={{ fontSize: '0.75rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>No recent notifications</div>
                    ) : (
                      notifications.slice(0, 4).map(n => (
                        <div
                          key={n._id}
                          onClick={() => handleMarkAsRead(n._id)}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '4px',
                            backgroundColor: n.read ? '#ffffff' : '#f8fafc',
                            borderLeft: `3px solid ${n.type === 'WARNING' ? '#f59e0b' : '#2563eb'}`,
                            cursor: 'pointer',
                            fontSize: '0.775rem'
                          }}
                        >
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{n.title}</div>
                          <div style={{ color: '#64748b', fontSize: '0.725rem' }}>{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.35rem 0.75rem', backgroundColor: '#f1f5f9', borderRadius: '9999px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0f2b5c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>{user?.name}</span>
                <span style={{ fontSize: '0.675rem', color: '#64748b' }}>{user?.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
