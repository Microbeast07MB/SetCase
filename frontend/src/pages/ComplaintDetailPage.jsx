import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Building,
  Sparkles,
  Send,
  GitMerge,
  Shield,
  MessageSquare,
  Lock,
  Calendar,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const LIFECYCLE_STEPS = [
  { id: 'Submitted', label: 'Submitted' },
  { id: 'Initial Review', label: 'Screening' },
  { id: 'Assigned to Bureau', label: 'Assigned' },
  { id: 'Under Investigation', label: 'Investigation' },
  { id: 'Resolved', label: 'Resolved' }
];

export const ComplaintDetailPage = ({ complaintId, setActiveTab, setSelectedComplaintId }) => {
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interactive UI Tabs: 'timeline' | 'investigation' | 'overlaps' | 'evidence'
  const [activeSubTab, setActiveSubTab] = useState('timeline');
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Officer action states
  const [statusToUpdate, setStatusToUpdate] = useState('');
  const [publicUpdateText, setPublicUpdateText] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [nextActionText, setNextActionText] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Student response state (awaiting documents)
  const [studentReply, setStudentReply] = useState('');

  const isStudent = user?.role === 'STUDENT';
  const isOfficer = user?.role === 'OFFICER';
  const isSupervisor = user?.role === 'SUPERVISOR';

  const loadComplaint = async () => {
    setLoading(true);
    try {
      const res = await api.getComplaintById(complaintId);
      if (res.success && res.complaint) {
        setComplaint(res.complaint);
        setStatusToUpdate(res.complaint.status);
        setNextActionText(res.complaint.nextPendingAction || '');
      } else {
        setError(res.message || 'Unable to retrieve complaint.');
      }
    } catch (err) {
      setError('Network error fetching complaint details.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (complaintId) {
      loadComplaint();
    }
  }, [complaintId]);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setActionSuccess('');
    try {
      const res = await api.updateStatus(complaint._id, {
        status: statusToUpdate,
        publicUpdate: publicUpdateText || `Status changed to ${statusToUpdate}`,
        internalNote: internalNoteText,
        nextAction: nextActionText
      });
      if (res.success) {
        setActionSuccess(`Status transitioned to "${statusToUpdate}"!`);
        setInternalNoteText('');
        setPublicUpdateText('');
        loadComplaint();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!internalNoteText.trim()) return;
    try {
      const res = await api.addInternalNote(complaint._id, internalNoteText);
      if (res.success) {
        setInternalNoteText('');
        setActionSuccess('Confidential officer note recorded in audit log.');
        loadComplaint();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRelationDecision = async (relatedId, action) => {
    try {
      const res = await api.updateRelation(complaint._id, {
        relatedComplaintId: relatedId,
        action,
        remarks: action === 'CONFIRM' ? 'Confirmed overlap in institutional fee patterns.' : 'Dismissed as unrelated.'
      });
      if (res.success) {
        setActionSuccess(`Suggestion marked as ${action === 'CONFIRM' ? 'Confirmed' : 'Rejected'}.`);
        loadComplaint();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStudentProvideInfo = async (e) => {
    e.preventDefault();
    try {
      const res = await api.provideMoreInfo(complaint._id, {
        responseText: studentReply
      });
      if (res.success) {
        setStudentReply('');
        setActionSuccess('Supplementary documents transmitted to reviewing officer.');
        loadComplaint();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        Loading complaint dossier and audit graph...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <AlertCircle size={32} color="#dc2626" style={{ margin: '0 auto 0.5rem' }} />
        <h2 style={{ fontSize: '1.2rem', color: '#0f2b5c' }}>{error || 'Complaint Not Found'}</h2>
        <button onClick={() => setActiveTab('dashboard')} className="btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Determine current lifecycle step index
  const currentStepIdx = LIFECYCLE_STEPS.findIndex(s => s.id === complaint.status);
  const resolvedIdx = complaint.status === 'Resolved' || complaint.status === 'Closed' ? 4 : currentStepIdx;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Top Bar Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setActiveTab(isStudent ? 'my-complaints' : 'officer-cases')}
          className="btn-secondary"
          style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <ArrowLeft size={14} /> Back to Register
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Priority:</span>
          <span className="badge badge-pending">{complaint.priority || 'Normal'}</span>
          <span
            className={
              complaint.status === 'Assigned to Bureau'
                ? 'badge badge-assigned'
                : complaint.status === 'Resolved' || complaint.status === 'Closed'
                ? 'badge badge-resolved'
                : 'badge badge-info'
            }
            style={{ fontSize: '0.8rem' }}
          >
            {complaint.status}
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: '0.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {actionSuccess}
        </div>
      )}

      {/* Visual Stepper Bar for Case Progress */}
      <div className="card" style={{ padding: '1.25rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          {/* Connector Line */}
          <div style={{ position: 'absolute', top: '14px', left: '20px', right: '20px', height: '3px', backgroundColor: '#e2e8f0', zIndex: 0 }} />
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '20px',
              width: `${Math.max(0, resolvedIdx >= 0 ? (resolvedIdx / (LIFECYCLE_STEPS.length - 1)) * 100 : 20)}%`,
              height: '3px',
              backgroundColor: '#2563eb',
              zIndex: 0,
              transition: 'width 0.4s ease'
            }}
          />

          {LIFECYCLE_STEPS.map((step, idx) => {
            const isCompleted = resolvedIdx >= idx;
            const isCurrent = complaint.status === step.id;

            return (
              <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? '#2563eb' : '#ffffff',
                    border: `2px solid ${isCompleted ? '#2563eb' : '#cbd5e1'}`,
                    color: isCompleted ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    boxShadow: isCurrent ? '0 0 0 4px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                >
                  {isCompleted ? <Check size={14} /> : idx + 1}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? '#0f2b5c' : '#64748b', marginTop: '0.35rem' }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI One-Line Summary Hero Box */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderLeft: '5px solid #0284c7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={20} color="#0284c7" />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI One-Line Case Summary
            </div>
            <div style={{ fontSize: '0.925rem', fontWeight: 600, color: '#0c4a6e', marginTop: '0.2rem', lineHeight: 1.45 }}>
              {complaint.oneLineSummary || 'Neutral fact summary calculated based on reported allegations.'}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>NEXT PENDING ACTION</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', maxWidth: '240px' }}>
            {complaint.nextPendingAction || 'Pending bureau review'}
          </div>
        </div>
      </div>

      {/* Main Complaint Header & Metadata */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>{complaint.complaintId}</span>
              <span className="badge badge-info">{complaint.category}</span>
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
              {complaint.title}
            </h1>
            <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '0.25rem' }}>
              Reported against: <strong>{complaint.institutionName}</strong> • {complaint.institutionLocation}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.7rem' }}>BUREAU DESK</div>
              <strong style={{ color: '#0f172a' }}>{complaint.assignedBureau || 'Approval Bureau'}</strong>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.7rem' }}>ASSIGNED OFFICER</div>
              <strong style={{ color: '#0f172a' }}>{complaint.assignedOfficerName || 'Unassigned'}</strong>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.7rem' }}>LODGED ON</div>
              <strong style={{ color: '#0f172a' }}>{new Date(complaint.createdAt).toLocaleDateString()}</strong>
            </div>
          </div>
        </div>

        {/* Collapsible Full Description (Prevents text bloat) */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Grievance Allegation Details
            </span>
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              {showFullDescription ? 'Collapse Text' : 'Expand Full Text'} {showFullDescription ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#334155', marginTop: '0.4rem', lineHeight: 1.55 }}>
            {showFullDescription ? complaint.description : `${complaint.description.slice(0, 160)}...`}
          </p>
        </div>

        {/* Evidence & Images Gallery */}
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Attached Evidence & Uploaded Records ({(complaint.supportingDocuments || []).length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {(complaint.supportingDocuments || []).map((doc, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.6rem 0.8rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem'
                }}
              >
                {doc.isImage || (doc.url && doc.url.startsWith('data:image')) ? (
                  <img
                    src={doc.url}
                    alt={doc.name}
                    style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                ) : (
                  <div style={{ width: '42px', height: '42px', borderRadius: '4px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={20} color="#2563eb" />
                  </div>
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {doc.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {doc.size || 'Verified Doc'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Tabs Menu for Deep Inspection */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.25rem' }}>
        <button
          onClick={() => setActiveSubTab('timeline')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderBottom: activeSubTab === 'timeline' ? '3px solid #2563eb' : 'none',
            backgroundColor: 'transparent',
            fontWeight: activeSubTab === 'timeline' ? 800 : 600,
            color: activeSubTab === 'timeline' ? '#2563eb' : '#64748b',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          Action Timeline ({complaint.timeline?.length || 0})
        </button>

        {(isOfficer || isSupervisor) && (
          <button
            onClick={() => setActiveSubTab('investigation')}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderBottom: activeSubTab === 'investigation' ? '3px solid #2563eb' : 'none',
              backgroundColor: 'transparent',
              fontWeight: activeSubTab === 'investigation' ? 800 : 600,
              color: activeSubTab === 'investigation' ? '#2563eb' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Officer Actions & Status Transition
          </button>
        )}

        {(isOfficer || isSupervisor) && (
          <button
            onClick={() => setActiveSubTab('overlaps')}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderBottom: activeSubTab === 'overlaps' ? '3px solid #2563eb' : 'none',
              backgroundColor: 'transparent',
              fontWeight: activeSubTab === 'overlaps' ? 800 : 600,
              color: activeSubTab === 'overlaps' ? '#2563eb' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Sparkles size={14} /> AI Suggested Matches ({complaint.suggestedOverlaps?.length || 0})
          </button>
        )}
      </div>

      {/* Subtab Content: Timeline */}
      {activeSubTab === 'timeline' && (
        <div className="card animate-fade-in" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.25rem' }}>
            <div style={{ position: 'absolute', left: '1.9rem', top: '10px', bottom: '10px', width: '2px', backgroundColor: '#e2e8f0' }} />

            {(complaint.timeline || []).map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#2563eb', border: '3px solid #ffffff', boxShadow: '0 0 0 2px #93c5fd', flexShrink: 0, marginTop: '3px' }} />
                <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>{t.title}</span>
                    <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>{new Date(t.timestamp).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '0.3rem' }}>
                    {t.description}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.35rem' }}>
                    By: <strong>{t.actionBy}</strong> ({t.role})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab Content: Officer Investigation Controls */}
      {activeSubTab === 'investigation' && (isOfficer || isSupervisor) && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
          
          {/* Status Update Form */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f2b5c', marginBottom: '1rem' }}>
              Transition Lifecycle State
            </h3>

            <form onSubmit={handleStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>New Status</label>
                <select
                  className="input-field"
                  value={statusToUpdate}
                  onChange={(e) => setStatusToUpdate(e.target.value)}
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Initial Review">Initial Review</option>
                  <option value="Awaiting Documents">Awaiting Documents</option>
                  <option value="Assigned to Bureau">Assigned to Bureau</option>
                  <option value="Under Investigation">Under Investigation</option>
                  <option value="Awaiting Departmental Action">Awaiting Departmental Action</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Public Update (Visible to Student)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Inquiry summons dispatched to College Principal."
                  value={publicUpdateText}
                  onChange={(e) => setPublicUpdateText(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Next Action Directive</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Audit of verified bank reconciliation sheets"
                  value={nextActionText}
                  onChange={(e) => setNextActionText(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Commit Status Transition
              </button>
            </form>
          </div>

          {/* Internal Notes Panel */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <Lock size={16} color="#64748b" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f2b5c' }}>
                Confidential Case Notes
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', marginBottom: '0.75rem' }}>
              {(complaint.internalNotes || []).length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>No notes yet.</div>
              ) : (
                (complaint.internalNotes || []).map((n, idx) => (
                  <div key={idx} style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.775rem' }}>
                    <div style={{ fontWeight: 600 }}>{n.author} ({n.role})</div>
                    <div style={{ color: '#334155', marginTop: '0.1rem' }}>{n.note}</div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Add confidential officer note..."
                value={internalNoteText}
                onChange={(e) => setInternalNoteText(e.target.value)}
              />
              <button type="submit" className="btn-secondary" style={{ padding: '0.5rem 0.85rem' }}>
                Save
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Subtab Content: Overlaps */}
      {activeSubTab === 'overlaps' && (isOfficer || isSupervisor) && (
        <div className="card animate-fade-in" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f2b5c', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={18} color="#2563eb" /> Potential Correlated Cases
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(complaint.suggestedOverlaps || []).length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                No correlated cases found meeting the similarity threshold.
              </div>
            ) : (
              (complaint.suggestedOverlaps || []).map(m => {
                const isConfirmed = m.state === 'CONFIRMED';
                const isRejected = m.state === 'REJECTED';

                return (
                  <div key={m.relatedComplaintId} style={{ padding: '0.85rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#2563eb' }}>{m.relatedComplaintId}</span>
                      <span style={{ fontWeight: 800, color: '#dc2626' }}>{m.similarityScore}% Match</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a', marginTop: '0.2rem' }}>
                      {m.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                      {m.reason}
                    </div>

                    <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.725rem', fontWeight: 700 }}>
                        {isConfirmed && <span style={{ color: '#059669' }}>✓ Confirmed Pattern</span>}
                        {isRejected && <span style={{ color: '#dc2626' }}>✗ Rejected Link</span>}
                        {!isConfirmed && !isRejected && <span style={{ color: '#64748b' }}>Pending Verification</span>}
                      </span>

                      {!isConfirmed && !isRejected && (
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleRelationDecision(m.relatedComplaintId, 'CONFIRM')}
                            className="btn-primary"
                            style={{ backgroundColor: '#059669', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                          >
                            <Check size={12} /> Confirm
                          </button>
                          <button
                            onClick={() => handleRelationDecision(m.relatedComplaintId, 'REJECT')}
                            className="btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: '#dc2626' }}
                          >
                            <X size={12} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Student: Document Prompt if Awaiting Documents */}
      {isStudent && complaint.status === 'Awaiting Documents' && (
        <div className="card animate-fade-in" style={{ padding: '1.5rem', borderLeft: '5px solid #d97706' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={18} /> Supplementary Documents Requested
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#78350f', marginTop: '0.25rem' }}>
            The reviewing officer has requested supplementary documents for this grievance.
          </p>
          <form onSubmit={handleStudentProvideInfo} style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <textarea
              required
              rows={2}
              className="input-field"
              placeholder="Provide confirmation of uploaded fee challans / documents..."
              value={studentReply}
              onChange={(e) => setStudentReply(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ width: 'fit-content' }}>
              Transmit Uploaded Documents
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
