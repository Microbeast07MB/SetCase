import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  FileText,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  Building
} from 'lucide-react';

export const MyComplaintsPage = ({ setActiveTab, setSelectedComplaintId }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.getComplaints();
      if (res.success) {
        setComplaints(res.complaints);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return <span className="badge badge-resolved">{status}</span>;
      case 'Initial Review':
      case 'Submitted':
        return <span className="badge badge-info">{status}</span>;
      case 'Awaiting Documents':
      case 'Awaiting Departmental Action':
        return <span className="badge badge-pending">{status}</span>;
      case 'Under Investigation':
        return <span className="badge badge-info">{status}</span>;
      default:
        return <span className="badge badge-pending">{status}</span>;
    }
  };

  const filtered = complaints.filter(c => {
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSearch = !searchQuery ||
      c.complaintId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.institutionName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f2b5c' }}>
            My Registered Complaints
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Grievances filed under your student identity with AICTE
          </p>
        </div>

        <button
          onClick={() => setActiveTab('submit')}
          className="btn-primary"
        >
          + Lodge New Grievance
        </button>
      </div>

      {/* Search and Quick Filters */}
      <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by ID, keyword, or institution..."
            style={{ paddingLeft: '2.2rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="#64748b" />
          <select
            className="input-field"
            style={{ width: 'auto' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Initial Review">Initial Review</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Awaiting Documents">Awaiting Documents</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Complaints List Table / Cards */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Loading your grievances...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <FileSearch size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#475569' }}>No grievances found matching your criteria.</div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Try clearing your filters or lodge a new complaint.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', divideY: '1px solid #e2e8f0' }}>
            {filtered.map((c) => (
              <div
                key={c._id}
                style={{
                  padding: '1.25rem',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s'
                }}
                onClick={() => {
                  setSelectedComplaintId(c._id);
                  setActiveTab('complaint-detail');
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.9rem' }}>{c.complaintId}</span>
                    {getStatusBadge(c.status)}
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Filed on {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                    {c.title}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                    <strong>{c.institutionName}</strong> • {c.category}
                  </div>

                  {c.oneLineSummary && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.775rem', color: '#0369a1', backgroundColor: '#f0f9ff', padding: '0.4rem 0.6rem', borderRadius: '4px', borderLeft: '3px solid #0284c7' }}>
                      <strong>AI Summary:</strong> {c.oneLineSummary}
                    </div>
                  )}

                  <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#475569' }}>
                    <strong>Next Action:</strong> {c.nextPendingAction || 'Pending bureau review'}
                  </div>
                </div>

                <div>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    Details <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
