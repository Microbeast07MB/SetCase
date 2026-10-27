import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building,
  Users,
  Star,
  ShieldCheck,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#8b5cf6', '#0284c7'];

export const AnalyticsPage = ({ setActiveTab, setSelectedComplaintId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.getDashboardAnalytics();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        Synthesizing real-time institutional metrics...
      </div>
    );
  }

  const { metrics, statusDistribution, categoryDistribution, bureauWorkload, officerWorkload, monthlyTrends, satisfactionStats } = data;

  const categoryBarData = categoryDistribution.map(c => ({
    name: c.category.length > 22 ? c.category.slice(0, 20) + '...' : c.category,
    fullName: c.category,
    count: c.count
  }));

  const bureauBarData = bureauWorkload.map(b => ({
    bureau: b.bureau.replace(' Bureau', ''),
    Active: b.pending,
    Resolved: b.resolved,
    Overdue: b.overdue
  }));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={24} color="#0f2b5c" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f2b5c' }}>
            Institutional Compliance & Analytics Command
          </h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
          Visual institutional intelligence derived from active registered grievance cases and feedback records
        </p>
      </div>

      {/* Primary KPI Grid with Visual Indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', borderTop: '4px solid #2563eb' }}>
          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Registered</span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>{metrics.total}</div>
          <div style={{ fontSize: '0.725rem', color: '#2563eb', fontWeight: 600, marginTop: '0.2rem' }}>100% case traceability</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderTop: '4px solid #059669' }}>
          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Resolution Velocity</span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: '0.35rem' }}>{metrics.avgResolutionDays} Days</div>
          <div style={{ fontSize: '0.725rem', color: '#059669', fontWeight: 600, marginTop: '0.2rem' }}>SLA Target: 15.0 days</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderTop: '4px solid #dc2626' }}>
          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>Overdue Grievances</span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#dc2626', marginTop: '0.35rem' }}>{metrics.overdue}</div>
          <div style={{ fontSize: '0.725rem', color: '#991b1b', fontWeight: 600, marginTop: '0.2rem' }}>Requires inspection panel</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderTop: '4px solid #d97706' }}>
          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Student Satisfaction</span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#d97706', marginTop: '0.35rem' }}>{satisfactionStats.averageRating} / 5.0</div>
          <div style={{ fontSize: '0.725rem', color: '#b45309', fontWeight: 600, marginTop: '0.2rem' }}>{satisfactionStats.totalReviews} student reviews</div>
        </div>
      </div>

      {/* Two Interactive Recharts Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr', gap: '1.5rem' }}>
        
        {/* Bureau Workload Multi-Bar Chart */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f2b5c', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Building size={16} /> Bureau Caseload Distribution
          </h2>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bureauBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="bureau" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                <Bar dataKey="Active" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Overdue" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Resolution Velocity Chart */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f2b5c', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={16} /> Intake vs. Resolution Velocity (6 Months)
          </h2>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                <Line type="monotone" dataKey="submitted" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} name="Grievances Filed" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Grievances Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Officer Caseload Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f2b5c', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Users size={18} /> Reviewing Officer Caseload & Resolution Velocity
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Officer</th>
                <th style={{ padding: '0.75rem 1rem' }}>Jurisdiction</th>
                <th style={{ padding: '0.75rem 1rem' }}>Total Assigned</th>
                <th style={{ padding: '0.75rem 1rem' }}>Active Pending</th>
                <th style={{ padding: '0.75rem 1rem' }}>Resolved</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {officerWorkload.map(o => (
                <tr key={o.officerId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>{o.name}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{o.bureau}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{o.totalAssigned}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#d97706', fontWeight: 700 }}>{o.activePending}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#059669', fontWeight: 700 }}>{o.resolved}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className={`badge ${o.activePending > 3 ? 'badge-overdue' : 'badge-resolved'}`}>
                      {o.activePending > 3 ? 'High Load' : 'Optimal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
