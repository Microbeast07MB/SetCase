import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Inbox,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Building,
  CheckCircle,
  AlertTriangle,
  GitMerge,
  ShieldAlert
} from 'lucide-react';

export const OfficerCasesPage = ({ setActiveTab, setSelectedComplaintId }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBureau, setFilterBureau] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [search, setSearch] = useState('');

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await api.getComplaints({
        isOverdue: filterOverdue ? 'true' : undefined
      });
      if (res.success) {
        setComplaints(res.complaints);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCases();
  }, [filterOverdue]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return <span className="badge badge-resolved">{status}</span>;
      case 'Assigned to Bureau':
        return <span className="badge badge-assigned">{status}</span>;
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
    const matchesBureau = filterBureau === 'ALL' || c.assignedBureau === filterBureau;
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSearch = !search ||
      c.complaintId.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.institutionName.toLowerCase().includes(search.toLowerCase());
    return matchesBureau && matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f2b5c' }}>
          Assigned Cases & Bureau Registry
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Active institutional grievances assigned to your bureau desk for compliance review
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by ID, title, or institution..."
            style={{ paddingLeft: '2.2rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="input-field"
          style={{ width: 'auto' }}
          value={filterBureau}
          onChange={(e) => setFilterBureau(e.target.value)}
        >
          <option value="ALL">All Bureaus</option>
          <option value="Approval Bureau">Approval Bureau</option>
          <option value="Finance & Accounts Bureau">Finance & Accounts Bureau</option>
          <option value="Policy & Academic Planning Bureau">Policy & Academic Planning Bureau</option>
          <option value="Vigilance & Grievance Cell">Vigilance & Grievance Cell</option>
        </select>

        <select
          className="input-field"
          style={{ width: 'auto' }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="Submitted">Submitted</option>
          <option value="Assigned to Bureau">Assigned to Bureau</option>
          <option value="Initial Review">Initial Review</option>
          <option value="Under Investigation">Under Investigation</option>
          <option value="Awaiting Documents">Awaiting Documents</option>
          <option value="Awaiting Departmental Action">Awaiting Departmental Action</option>
          <option value="Resolved">Resolved</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={filterOverdue}
            onChange={(e) => setFilterOverdue(e.target.checked)}
          />
          Overdue Only
        </label>
      </div>

      {/* Table Representation */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
              <th style={{ padding: '0.875rem 1rem' }}>Reference ID</th>
              <th style={{ padding: '0.875rem 1rem' }}>Title & Issue</th>
              <th style={{ padding: '0.875rem 1rem' }}>Institution</th>
              <th style={{ padding: '0.875rem 1rem' }}>Bureau</th>
              <th style={{ padding: '0.875rem 1rem' }}>Status</th>
              <th style={{ padding: '0.875rem 1rem' }}>Next Action</th>
              <th style={{ padding: '0.875rem 1rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  Loading cases...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No cases found matching filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const isOverdue = c.dueDate && new Date(c.dueDate) < new Date() && c.status !== 'Resolved' && c.status !== 'Closed';
                return (
                  <tr
                    key={c._id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: isOverdue ? '#fff5f5' : '#ffffff',
                      transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isOverdue ? '#fee2e2' : '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isOverdue ? '#fff5f5' : '#ffffff')}
                  >
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#2563eb' }}>
                      {c.complaintId}
                      {isOverdue && (
                        <span className="badge badge-overdue" style={{ display: 'block', width: 'fit-content', marginTop: '0.2rem', fontSize: '0.65rem' }}>
                          OVERDUE
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', maxWidth: '280px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>{c.category}</div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#334155' }}>
                      <strong>{c.institutionName}</strong>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#475569' }}>
                      {c.assignedBureau || 'Approval Bureau'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {getStatusBadge(c.status)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: '#475569', maxWidth: '200px' }}>
                      {c.nextPendingAction || 'Pending bureau review'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <button
                        onClick={() => {
                          setSelectedComplaintId(c._id);
                          setActiveTab('complaint-detail');
                        }}
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                      >
                        Inspect <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
