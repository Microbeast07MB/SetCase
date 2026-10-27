import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  GitMerge,
  Sparkles,
  CheckCircle2,
  XCircle,
  Building,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';

export const SmartOverlapPage = ({ setActiveTab, setSelectedComplaintId }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchCasesWithMatches = async () => {
    setLoading(true);
    try {
      const res = await api.getComplaints();
      if (res.success && res.complaints) {
        setComplaints(res.complaints);
        if (res.complaints.length > 0 && !selectedCase) {
          // Fetch complete detail with overlaps for first case
          loadCaseDetail(res.complaints[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const loadCaseDetail = async (id) => {
    try {
      const res = await api.getComplaintById(id);
      if (res.success && res.complaint) {
        setSelectedCase(res.complaint);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCasesWithMatches();
  }, []);

  const handleDecision = async (relatedId, action) => {
    if (!selectedCase) return;
    try {
      const res = await api.updateRelation(selectedCase._id, {
        relatedComplaintId: relatedId,
        action,
        remarks: action === 'CONFIRM' ? 'Confirmed relationship between cases by officer.' : 'Suggestion dismissed as unrelated.'
      });
      if (res.success) {
        setActionSuccess(`Suggestion marked as ${action === 'CONFIRM' ? 'Confirmed' : 'Rejected'}.`);
        loadCaseDetail(selectedCase._id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GitMerge size={22} color="#0f2b5c" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f2b5c' }}>
            AI-Assisted Smart Overlap Detection
          </h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
          Correlates institutional grievances based on shared institution identifier, category patterns, incident timelines, and semantic text overlap.
        </p>
      </div>

      {actionSuccess && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: '0.375rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {actionSuccess}
        </div>
      )}

      {/* Two Pane Layout: Case Selector and Overlap Inspection */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left: Source Complaints */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f2b5c', marginBottom: '0.75rem' }}>
            Select Active Case to Inspect
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '550px', overflowY: 'auto' }}>
            {complaints.map((c) => {
              const isSelected = selectedCase?._id === c._id;
              return (
                <div
                  key={c._id}
                  onClick={() => loadCaseDetail(c._id)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    border: `1px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.8rem' }}>{c.complaintId}</span>
                    <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{c.status}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a', marginTop: '0.2rem' }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                    {c.institutionName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detected Overlaps & Scoring */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {selectedCase ? (
            <>
              {/* Target Case Context Card */}
              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#f8fafc' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Selected Reference Case</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f2b5c', marginTop: '0.2rem' }}>
                  {selectedCase.complaintId}: {selectedCase.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.25rem' }}>
                  Institution: <strong>{selectedCase.institutionName}</strong> • Category: <strong>{selectedCase.category}</strong>
                </div>
                {selectedCase.oneLineSummary && (
                  <div style={{ marginTop: '0.5rem', padding: '0.45rem 0.65rem', backgroundColor: '#e0f2fe', borderRadius: '4px', fontSize: '0.75rem', color: '#0369a1' }}>
                    <strong>AI Summary:</strong> {selectedCase.oneLineSummary}
                  </div>
                )}
              </div>

              {/* Suggestions Panel */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f2b5c', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={18} color="#2563eb" /> Potential Related Complaints ({selectedCase.suggestedOverlaps?.length || 0})
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Algorithm threshold: ≥ 50%</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(selectedCase.suggestedOverlaps || []).length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                      No other complaints in the repository meet the similarity threshold for this case.
                    </div>
                  ) : (
                    (selectedCase.suggestedOverlaps || []).map((m) => {
                      const isConfirmed = m.state === 'CONFIRMED';
                      const isRejected = m.state === 'REJECTED';

                      return (
                        <div
                          key={m.relatedComplaintId}
                          style={{
                            padding: '1rem',
                            borderRadius: '0.375rem',
                            border: `1px solid ${isConfirmed ? '#a7f3d0' : isRejected ? '#fecaca' : '#e2e8f0'}`,
                            backgroundColor: isConfirmed ? '#f0fdf4' : isRejected ? '#fef2f2' : '#ffffff'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.9rem' }}>{m.relatedComplaintId}</span>
                              <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{m.status}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Similarity Score:</span>
                              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: m.similarityScore >= 70 ? '#dc2626' : '#d97706' }}>
                                {m.similarityScore}%
                              </span>
                            </div>
                          </div>

                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginTop: '0.35rem' }}>
                            {m.title}
                          </div>

                          <div style={{ fontSize: '0.775rem', color: '#475569', marginTop: '0.2rem' }}>
                            {m.institutionName} • Category: {m.category}
                          </div>

                          {/* Reason breakdown */}
                          <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#334155' }}>
                            <strong>Suggested Match Reason:</strong> {m.reason}
                          </div>

                          {/* Actions */}
                          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px dashed #cbd5e1' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                              {isConfirmed && <span style={{ color: '#059669' }}>✓ Confirmed by Officer: Pattern Complaint</span>}
                              {isRejected && <span style={{ color: '#dc2626' }}>✗ Rejected by Officer: Unrelated</span>}
                              {!isConfirmed && !isRejected && <span style={{ color: '#64748b' }}>Action Required: Confirm or Reject Link</span>}
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {!isConfirmed && !isRejected && (
                                <>
                                  <button
                                    onClick={() => handleDecision(m.relatedComplaintId, 'CONFIRM')}
                                    className="btn-primary"
                                    style={{ backgroundColor: '#059669', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                                  >
                                    <Check size={14} /> Confirm Relationship
                                  </button>
                                  <button
                                    onClick={() => handleDecision(m.relatedComplaintId, 'REJECT')}
                                    className="btn-secondary"
                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: '#dc2626' }}
                                  >
                                    <X size={14} /> Reject
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => {
                                  setSelectedComplaintId(m.relatedMongoId);
                                  setActiveTab('complaint-detail');
                                }}
                                className="btn-secondary"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                              >
                                View Case Details <ArrowRight size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              Select a complaint from the left panel to run smart overlap detection.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
