import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Network,
  Users,
  Building,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const BureauCoordinationPage = ({ setActiveTab, setSelectedComplaintId }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [targetBureau, setTargetBureau] = useState('Approval Bureau');
  const [targetOfficer, setTargetOfficer] = useState('Dr. Rajesh Verma');
  const [priority, setPriority] = useState('Normal');
  const [transferReason, setTransferReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const bureaus = [
    { name: 'Approval Bureau', officer: 'Dr. Rajesh Verma', officerId: 'usr_officer_01' },
    { name: 'Finance & Accounts Bureau', officer: 'Dr. Sunita Kulkarni', officerId: 'usr_officer_02' },
    { name: 'Policy & Academic Planning Bureau', officer: 'Dr. Rajesh Verma', officerId: 'usr_officer_01' },
    { name: 'AICTE Central Grievance Cell', officer: 'Dr. Arvind Mehra', officerId: 'usr_supervisor_01' }
  ];

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.getComplaints();
      if (res.success && res.complaints) {
        setComplaints(res.complaints);
        if (res.complaints.length > 0 && !selectedComplaint) {
          setSelectedComplaint(res.complaints[0]);
          setTargetBureau(res.complaints[0].assignedBureau || 'Approval Bureau');
          setTargetOfficer(res.complaints[0].assignedOfficerName || 'Dr. Rajesh Verma');
          setPriority(res.complaints[0].priority || 'Normal');
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSelectCase = (c) => {
    setSelectedComplaint(c);
    setTargetBureau(c.assignedBureau || 'Approval Bureau');
    setTargetOfficer(c.assignedOfficerName || 'Dr. Rajesh Verma');
    setPriority(c.priority || 'Normal');
    setTransferReason('');
    setActionSuccess('');
  };

  const handleBureauChange = (bureauName) => {
    setTargetBureau(bureauName);
    const found = bureaus.find(b => b.name === bureauName);
    if (found) {
      setTargetOfficer(found.officer);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    if (!transferReason.trim()) {
      alert('Please provide a mandatory transfer reason for inter-bureau tracking.');
      return;
    }

    const foundBureau = bureaus.find(b => b.name === targetBureau);

    try {
      const res = await api.assignComplaint(selectedComplaint._id, {
        bureau: targetBureau,
        officerId: foundBureau?.officerId || 'usr_officer_01',
        officerName: targetOfficer,
        priority,
        reason: transferReason
      });

      if (res.success) {
        setActionSuccess(`Case ${selectedComplaint.complaintId} successfully reassigned to ${targetBureau} (${targetOfficer}).`);
        fetchComplaints();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Network size={22} color="#0f2b5c" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f2b5c' }}>
            Bureau Coordination & Case Reassignment
          </h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
          Supervisor desk for reallocating jurisdictional responsibility, balancing officer workload, and tracking inter-departmental transfers.
        </p>
      </div>

      {actionSuccess && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: '0.375rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {actionSuccess}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left: Complaints List */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f2b5c', marginBottom: '0.75rem' }}>
            Active Cases in Coordination Registry
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '560px', overflowY: 'auto' }}>
            {complaints.map((c) => {
              const isSelected = selectedComplaint?._id === c._id;
              return (
                <div
                  key={c._id}
                  onClick={() => handleSelectCase(c)}
                  style={{
                    padding: '0.875rem',
                    borderRadius: '0.375rem',
                    border: `1px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.85rem' }}>{c.complaintId}</span>
                    <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{c.status}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginTop: '0.25rem' }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Bureau: <strong>{c.assignedBureau || 'Approval Bureau'}</strong></span>
                    <span>Officer: <strong>{c.assignedOfficerName || 'Unassigned'}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Transfer & Reassignment Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {selectedComplaint ? (
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f2b5c', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>
                <ArrowRightLeft size={18} /> Transfer / Reassign Responsibility
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
                <div>Selected Case: <strong>{selectedComplaint.complaintId}</strong></div>
                <div style={{ color: '#475569', marginTop: '0.2rem' }}>{selectedComplaint.title}</div>
                <div style={{ color: '#64748b', marginTop: '0.2rem' }}>Institution: {selectedComplaint.institutionName}</div>
                <div style={{ marginTop: '0.35rem', color: '#2563eb' }}>
                  Current Desk: <strong>{selectedComplaint.assignedBureau}</strong> → {selectedComplaint.assignedOfficerName}
                </div>
              </div>

              <form onSubmit={handleTransferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Target Responsible Bureau <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    className="input-field"
                    value={targetBureau}
                    onChange={(e) => handleBureauChange(e.target.value)}
                  >
                    {bureaus.map(b => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Assigned Officer Desk
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={targetOfficer}
                    onChange={(e) => setTargetOfficer(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Urgency & Priority Flag
                  </label>
                  <select
                    className="input-field"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Normal">Normal (15-Day SLA Target)</option>
                    <option value="High">High (7-Day SLA Target)</option>
                    <option value="Urgent">Urgent (48-Hour Priority Roster)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Official Transfer Reason (Mandatory Audit Requirement) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="input-field"
                    placeholder="e.g. Reassigned to Finance Bureau following discovery of fee collection irregularities beyond academic scope..."
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                  Execute Inter-Bureau Transfer
                </button>
              </form>
            </div>
          ) : (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              Select a case from the list to initiate coordination transfer.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
