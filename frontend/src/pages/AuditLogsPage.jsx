import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Shield,
  FileCheck,
  Search,
  Lock,
  UserCheck
} from 'lucide-react';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs({ limit: 100 });
      if (res.success) {
        setLogs(res.logs);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter(l =>
    !search ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    (l.complaintId && l.complaintId.toLowerCase().includes(search.toLowerCase())) ||
    l.userName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={22} color="#0f2b5c" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f2b5c' }}>
            Permanent Institutional Compliance Audit Trail
          </h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
          Immutable system log capturing all status transitions, inter-bureau case assignments, and AI relationship confirmations.
        </p>
      </div>

      <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Search size={16} color="#94a3b8" />
        <input
          type="text"
          className="input-field"
          placeholder="Filter audit logs by action, officer, or case ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
              <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
              <th style={{ padding: '0.75rem 1rem' }}>Action Event</th>
              <th style={{ padding: '0.75rem 1rem' }}>Case Reference</th>
              <th style={{ padding: '0.75rem 1rem' }}>Officer / Actor</th>
              <th style={{ padding: '0.75rem 1rem' }}>Role</th>
              <th style={{ padding: '0.75rem 1rem' }}>Audit Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  Loading compliance audit trail...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No audit logs matching query.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#2563eb' }}>
                    {log.complaintId || 'GLOBAL'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                    {log.userName}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                    {log.userRole}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>
                    {log.details}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
