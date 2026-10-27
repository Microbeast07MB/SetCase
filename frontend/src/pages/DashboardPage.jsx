import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  Hourglass,
  ArrowRight,
  Sparkles,
  Building,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Filter,
  Check,
  Zap,
  TrendingUp,
  ShieldCheck,
  Eye,
  Activity
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';

const STATUS_COLORS = {
  'Submitted': '#3b82f6',
  'Assigned to Bureau': '#6366f1',
  'Initial Review': '#0ea5e9',
  'Under Investigation': '#4f46e5',
  'Awaiting Documents': '#f59e0b',
  'Awaiting Departmental Action': '#ec4899',
  'Resolved': '#10b981',
  'Closed': '#64748b'
};

export const DashboardPage = ({ setActiveTab, setSelectedComplaintId }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Interactive filters
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [expandedSummaryId, setExpandedSummaryId] = useState(null);

  const isStudent = user?.role === 'STUDENT';
  const isOfficer = user?.role === 'OFFICER';
  const isSupervisor = user?.role === 'SUPERVISOR';

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [anaRes, compRes] = await Promise.all([
          api.getDashboardAnalytics(),
          api.getComplaints()
        ]);
        if (anaRes.success) setAnalytics(anaRes);
        if (compRes.success) {
          setComplaints(compRes.complaints);
          // auto-expand top case AI summary
          if (compRes.complaints.length > 0) {
            setExpandedSummaryId(compRes.complaints[0]._id);
          }
        }
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
      }
      setLoading(false);
    };
    loadDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return <span className="badge badge-resolved"><CheckCircle2 size={12} /> {status}</span>;
      case 'Assigned to Bureau':
        return <span className="badge badge-assigned"><Clock size={12} /> {status}</span>;
      case 'Initial Review':
      case 'Submitted':
        return <span className="badge badge-info"><Clock size={12} /> {status}</span>;
      case 'Awaiting Documents':
      case 'Awaiting Departmental Action':
        return <span className="badge badge-pending"><AlertCircle size={12} /> {status}</span>;
      case 'Under Investigation':
        return <span className="badge badge-info"><Activity size={12} /> {status}</span>;
      default:
        return <span className="badge badge-pending">{status}</span>;
    }
  };

  const handleCaseClick = (id) => {
    setSelectedComplaintId(id);
    setActiveTab('complaint-detail');
  };

  const toggleSummary = (e, id) => {
    e.stopPropagation();
    setExpandedSummaryId(prev => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '360px', color: '#64748b' }}>
        <Hourglass className="animate-spin" size={28} style={{ color: '#2563eb', marginBottom: '0.75rem' }} />
        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Loading SetuCase Intelligence Hub...</span>
      </div>
    );
  }

  const metrics = analytics?.metrics || {
    total: complaints.length,
    newComplaints: 1,
    underReview: 2,
    awaitingDocs: 1,
    awaitingDept: 1,
    overdue: 1,
    resolved: 1,
    avgResolutionDays: '6.4'
  };

  // Filter complaints dynamically by card filter
  const displayedComplaints = complaints.filter(c => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'INVESTIGATION') return c.status === 'Assigned to Bureau' || c.status === 'Under Investigation' || c.status === 'Initial Review';
    if (activeFilter === 'AWAITING') return c.status === 'Awaiting Documents' || c.status === 'Awaiting Departmental Action';
    if (activeFilter === 'RESOLVED') return c.status === 'Resolved' || c.status === 'Closed';
    if (activeFilter === 'OVERDUE') {
      return c.status !== 'Resolved' && c.status !== 'Closed' && c.dueDate && new Date(c.dueDate) < new Date();
    }
    return true;
  });

  const pieData = (analytics?.statusDistribution || []).map(s => ({
    name: s.name,
    value: s.value,
    color: STATUS_COLORS[s.name] || '#3b82f6'
  }));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Interactive Hero Header */}
      <div
        className="card"
        style={{
          padding: '1.5rem 2rem',
          background: 'linear-gradient(135deg, #091a38 0%, #1e3a8a 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 20px -4px rgba(15, 43, 92, 0.25)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#93c5fd', fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
              {isStudent ? 'STUDENT COMPLAINANT PORTAL' : isOfficer ? 'BUREAU INVESTIGATION DESK' : 'CENTRAL GRIEVANCE COMMAND'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#86efac' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} /> Live Synced
            </span>
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.4rem', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.name}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#cbd5e1', marginTop: '0.25rem', maxWidth: '640px' }}>
            {isStudent && 'Track institutional verification in real time, review AI case summaries, and verify resolution compliance.'}
            {isOfficer && 'Verify compliance dossiers, review AI cross-case overlap patterns, and manage inter-bureau coordination.'}
            {isSupervisor && 'Monitor resolution velocity, inter-bureau queues, and institutional grievance trends across technical institutes.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isStudent && (
            <button
              onClick={() => setActiveTab('submit')}
              className="btn-primary"
              style={{ backgroundColor: '#2563eb', padding: '0.75rem 1.35rem', fontSize: '0.875rem', border: 'none' }}
            >
              + Lodge Grievance
            </button>
          )}
          {isOfficer && (
            <button
              onClick={() => setActiveTab('smart-overlap')}
              className="btn-primary"
              style={{ backgroundColor: '#2563eb', padding: '0.75rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Sparkles size={16} /> AI Pattern Detector
            </button>
          )}
        </div>
      </div>

      {/* Interactive Metric Cards (Clicking filters list immediately!) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        
        <div
          onClick={() => setActiveFilter('ALL')}
          className="card card-interactive"
          style={{
            padding: '1.25rem',
            cursor: 'pointer',
            borderBottom: activeFilter === 'ALL' ? '4px solid #2563eb' : '1px solid #e2e8f0',
            backgroundColor: activeFilter === 'ALL' ? '#eff6ff' : '#ffffff'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>All Cases</span>
            <FileText size={18} color="#2563eb" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
            {isStudent ? complaints.length : metrics.total}
          </div>
          <div style={{ fontSize: '0.725rem', color: '#2563eb', fontWeight: 600, marginTop: '0.2rem' }}>
            Click to view all
          </div>
        </div>

        <div
          onClick={() => setActiveFilter('INVESTIGATION')}
          className="card card-interactive"
          style={{
            padding: '1.25rem',
            cursor: 'pointer',
            borderBottom: activeFilter === 'INVESTIGATION' ? '4px solid #0284c7' : '1px solid #e2e8f0',
            backgroundColor: activeFilter === 'INVESTIGATION' ? '#f0f9ff' : '#ffffff'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>In Review</span>
            <Clock size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0284c7', marginTop: '0.35rem' }}>
            {isStudent ? complaints.filter(c => c.status === 'Assigned to Bureau' || c.status === 'Initial Review' || c.status === 'Under Investigation').length : metrics.underReview}
          </div>
          <div style={{ fontSize: '0.725rem', color: '#0284c7', fontWeight: 600, marginTop: '0.2rem' }}>
            Filter active reviews
          </div>
        </div>

        <div
          onClick={() => setActiveFilter('AWAITING')}
          className="card card-interactive"
          style={{
            padding: '1.25rem',
            cursor: 'pointer',
            borderBottom: activeFilter === 'AWAITING' ? '4px solid #d97706' : '1px solid #e2e8f0',
            backgroundColor: activeFilter === 'AWAITING' ? '#fffbeb' : '#ffffff'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>Action Required</span>
            <AlertCircle size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#d97706', marginTop: '0.35rem' }}>
            {isStudent ? complaints.filter(c => c.status === 'Awaiting Documents').length : (metrics.awaitingDocs + metrics.awaitingDept)}
          </div>
          <div style={{ fontSize: '0.725rem', color: '#b45309', fontWeight: 600, marginTop: '0.2rem' }}>
            Filter action items
          </div>
        </div>

        <div
          onClick={() => setActiveFilter('RESOLVED')}
          className="card card-interactive"
          style={{
            padding: '1.25rem',
            cursor: 'pointer',
            borderBottom: activeFilter === 'RESOLVED' ? '4px solid #059669' : '1px solid #e2e8f0',
            backgroundColor: activeFilter === 'RESOLVED' ? '#ecfdf5' : '#ffffff'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Resolved</span>
            <CheckCircle2 size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: '0.35rem' }}>
            {isStudent ? complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length : metrics.resolved}
          </div>
          <div style={{ fontSize: '0.725rem', color: '#059669', fontWeight: 600, marginTop: '0.2rem' }}>
            {metrics.avgResolutionDays} days avg. speed
          </div>
        </div>

        {(isOfficer || isSupervisor) && (
          <div
            onClick={() => setActiveFilter('OVERDUE')}
            className="card card-interactive"
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              borderBottom: activeFilter === 'OVERDUE' ? '4px solid #dc2626' : '1px solid #e2e8f0',
              backgroundColor: activeFilter === 'OVERDUE' ? '#fef2f2' : '#ffffff'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>Overdue SLA</span>
              <ShieldAlert size={18} color="#dc2626" />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#dc2626', marginTop: '0.35rem' }}>
              {metrics.overdue}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#dc2626', fontWeight: 600, marginTop: '0.2rem' }}>
              Filter overdue
            </div>
          </div>
        )}

      </div>

      {/* Main Two-Column Interactive Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Interactive Complaint Cards with Expandable AI Summaries */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f2b5c' }}>
                  {isStudent ? 'Grievance Cases' : 'Compliance Queue'}
                </h2>
                <span className="badge badge-info">{displayedComplaints.length} Shown</span>
              </div>
              <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.2rem' }}>
                Showing: <strong>{activeFilter}</strong> • Click any card for full dossier & timeline
              </p>
            </div>

            {activeFilter !== 'ALL' && (
              <button
                onClick={() => setActiveFilter('ALL')}
                style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Reset Filter
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {displayedComplaints.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                <FileText size={32} style={{ margin: '0 auto 0.5rem', color: '#cbd5e1' }} />
                <div style={{ fontWeight: 600, color: '#475569' }}>No complaints found under filter "{activeFilter}"</div>
              </div>
            ) : (
              displayedComplaints.map((c) => {
                const isExpanded = expandedSummaryId === c._id;
                const isOverdue = c.dueDate && new Date(c.dueDate) < new Date() && c.status !== 'Resolved' && c.status !== 'Closed';

                return (
                  <div
                    key={c._id}
                    onClick={() => handleCaseClick(c._id)}
                    className="card-interactive"
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${isOverdue ? '#fca5a5' : '#e2e8f0'}`,
                      backgroundColor: isOverdue ? '#fffbfb' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#2563eb' }}>{c.complaintId}</span>
                        {getStatusBadge(c.status)}
                        {isOverdue && <span className="badge badge-overdue" style={{ fontSize: '0.65rem' }}>OVERDUE SLA</span>}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={(e) => toggleSummary(e, c._id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: isExpanded ? '#dbeafe' : '#f1f5f9',
                            color: '#1e40af',
                            borderRadius: '4px',
                            border: 'none',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Sparkles size={12} color="#2563eb" />
                          AI Summary {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>

                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.35 }}>
                      {c.title}
                    </div>

                    <div style={{ fontSize: '0.775rem', color: '#64748b' }}>
                      <strong>{c.institutionName}</strong> • {c.category}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#4338ca', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span><strong>Bureau:</strong> {c.assignedBureau || 'Approval Bureau'}</span>
                      {c.assignedOfficerName && c.assignedOfficerName !== 'Unassigned' && (
                        <span>• <strong>Officer:</strong> {c.assignedOfficerName}</span>
                      )}
                    </div>

                    {/* Expandable One-Line AI Summary Box */}
                    {isExpanded && c.oneLineSummary && (
                      <div
                        className="animate-fade-in"
                        style={{
                          padding: '0.65rem 0.85rem',
                          backgroundColor: '#f0f9ff',
                          borderLeft: '4px solid #0284c7',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          color: '#0369a1',
                          marginTop: '0.25rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.725rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                          <Sparkles size={13} /> Generated Neutral Fact Summary:
                        </div>
                        <div style={{ fontWeight: 500, lineHeight: 1.45 }}>
                          {c.oneLineSummary}
                        </div>
                      </div>
                    )}

                    {/* Action Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem', paddingTop: '0.5rem', borderTop: '1px dashed #f1f5f9', fontSize: '0.75rem' }}>
                      <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>Next:</span> {c.nextPendingAction || 'Pending bureau review'}
                      </span>
                      <span style={{ color: '#2563eb', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Inspect Case <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Visual Charts & Interactive Overlap Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Visual Chart: Status Distribution */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f2b5c', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Case Status Distribution</span>
              <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 500 }}>Live Data</span>
            </h3>

            <div style={{ height: '180px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Micro Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
              {pieData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#475569' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: d.color }} />
                  <span>{d.name}: <strong>{d.value}</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive AI Overlap Alert Card */}
          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #2563eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '0.9rem', color: '#0f2b5c' }}>
                <Sparkles size={16} color="#2563eb" /> AI Pattern Alert
              </div>
              <span className="badge badge-pending" style={{ fontSize: '0.65rem' }}>75% Similarity</span>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#334155', marginTop: '0.5rem', lineHeight: 1.45 }}>
              The matching engine flagged potential systemic fee issues across <strong>SC-2026-0001</strong> and <strong>SC-2026-0002</strong> at <em>ABC Institute of Technology</em>.
            </p>

            <button
              onClick={() => setActiveTab('smart-overlap')}
              className="btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.8rem', padding: '0.5rem', backgroundColor: '#0f2b5c' }}
            >
              Open AI Overlap Studio →
            </button>
          </div>

          {/* Bureau Balance Mini Progress */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f2b5c', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building size={16} /> Bureau Allocation Health
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(analytics?.bureauWorkload || []).map(b => (
                <div key={b.bureau}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', fontWeight: 600, color: '#334155', marginBottom: '0.2rem' }}>
                    <span>{b.bureau}</span>
                    <span>{b.total} Cases ({b.pending} Active)</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, b.total * 20)}%`, height: '100%', backgroundColor: '#2563eb', borderRadius: '3px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
