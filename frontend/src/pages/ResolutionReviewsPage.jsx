import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  MessageSquareQuote,
  Star,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Building,
  UserCheck
} from 'lucide-react';

export const ResolutionReviewsPage = ({ setActiveTab, setSelectedComplaintId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [resolvedComplaints, setResolvedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review submission state (Student)
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [satisfaction, setSatisfaction] = useState('Yes');
  const [rating, setRating] = useState(5);
  const [difficulties, setDifficulties] = useState([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [reopenRequest, setReopenRequest] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');

  const isStudent = user?.role === 'STUDENT';
  const isSupervisor = user?.role === 'SUPERVISOR';
  const isOfficer = user?.role === 'OFFICER';

  const potentialDifficulties = [
    'Initial response delay from institution',
    'Repeated document submissions requested',
    'Lack of communication from bureau',
    'College administration retaliatory behavior',
    'Incomplete fee refund'
  ];

  const fetchReviewData = async () => {
    setLoading(true);
    try {
      const [revRes, compRes] = await Promise.all([
        api.getReviews(),
        api.getComplaints({ status: 'Resolved' })
      ]);
      if (revRes.success) setReviews(revRes.reviews);
      if (compRes.success) {
        setResolvedComplaints(compRes.complaints);
        if (compRes.complaints.length > 0 && !selectedCaseId) {
          setSelectedCaseId(compRes.complaints[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviewData();
  }, []);

  const handleDifficultyToggle = (item) => {
    setDifficulties(prev =>
      prev.includes(item) ? prev.filter(d => d !== item) : [...prev, item]
    );
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCaseId) return;

    try {
      const res = await api.submitReview({
        complaintId: selectedCaseId,
        resolvedSatisfaction: satisfaction,
        rating,
        difficultiesEncountered: difficulties,
        writtenFeedback: feedbackText,
        reopenRequest: reopenRequest && satisfaction === 'No'
      });

      if (res.success) {
        setSubmitSuccess(res.message);
        setFeedbackText('');
        fetchReviewData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquareQuote size={22} color="#0f2b5c" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f2b5c' }}>
            Resolution Review & Complainant Satisfaction
          </h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
          Two-way accountability: verifies whether an officer-marked resolution actually resolved the student's grievance.
        </p>
      </div>

      {submitSuccess && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: '0.375rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {submitSuccess}
        </div>
      )}

      {/* If Student, show Review Form for Resolved cases */}
      {isStudent && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f2b5c', marginBottom: '0.75rem' }}>
            Submit Feedback on Your Resolved Grievance
          </h2>

          {resolvedComplaints.length === 0 ? (
            <div style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
              None of your complaints are currently marked as resolved. You can submit feedback once an officer concludes investigation.
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Select Resolved Grievance <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  className="input-field"
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                >
                  {resolvedComplaints.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.complaintId} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Did the institution comply and resolve the issue? <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {['Yes', 'Partially', 'No'].map(opt => (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="satisfaction"
                        value={opt}
                        checked={satisfaction === opt}
                        onChange={(e) => setSatisfaction(e.target.value)}
                      />
                      {opt === 'Yes' ? 'Fully Resolved' : opt === 'Partially' ? 'Partially Resolved' : 'Unresolved / Retaliation'}
                    </label>
                  ))}
                </div>
              </div>

              {satisfaction === 'No' && (
                <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#991b1b', fontWeight: 600, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={reopenRequest}
                      onChange={(e) => setReopenRequest(e.target.checked)}
                    />
                    Request immediate supervisory escalation & case reopening
                  </label>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Satisfaction Rating (1 to 5 Stars)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                    >
                      <Star size={24} color={star <= rating ? '#f59e0b' : '#cbd5e1'} fill={star <= rating ? '#f59e0b' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Any Difficulties Encountered During Grievance Lifecycle?
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {potentialDifficulties.map(d => (
                    <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={difficulties.includes(d)}
                        onChange={() => handleDifficultyToggle(d)}
                      />
                      {d}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Written Review / Experience
                </label>
                <textarea
                  rows={3}
                  className="input-field"
                  placeholder="Share details regarding how the bureau handled the case and whether your documents were returned..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: 'fit-content' }}>
                Submit Review
              </button>
            </form>
          )}
        </div>
      )}

      {/* Public / Officer / Supervisor Feed of Reviews */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f2b5c', marginBottom: '1rem' }}>
          Logged Resolution Reviews Registry ({reviews.length})
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
              No reviews registered yet.
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r._id} style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.85rem' }}>{r.complaintId}</span>
                      <span className={`badge ${r.resolvedSatisfaction === 'Yes' ? 'badge-resolved' : 'badge-overdue'}`}>
                        {r.resolvedSatisfaction === 'Yes' ? 'Confirmed Resolved' : 'Marked Unresolved by Student'}
                      </span>
                      {r.reopenRequested && <span className="badge badge-overdue">REOPENED</span>}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', marginTop: '0.2rem' }}>
                      {r.complaintTitle}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Reviewed by: <strong>{r.studentName}</strong> • Resolved in <strong>{r.timeTakenDays} days</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} color={i < r.rating ? '#f59e0b' : '#cbd5e1'} fill={i < r.rating ? '#f59e0b' : 'none'} />
                    ))}
                  </div>
                </div>

                {r.writtenFeedback && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#334155', fontStyle: 'italic', backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
                    "{r.writtenFeedback}"
                  </div>
                )}

                {(r.difficultiesEncountered || []).length > 0 && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {r.difficultiesEncountered.map((d, idx) => (
                      <span key={idx} style={{ fontSize: '0.7rem', backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                        {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
