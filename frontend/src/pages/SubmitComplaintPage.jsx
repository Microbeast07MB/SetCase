import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import {
  FilePlus,
  Upload,
  CheckCircle,
  AlertCircle,
  Building,
  Calendar,
  FileCheck,
  ShieldCheck,
  Info,
  X,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

export const SubmitComplaintPage = ({ setActiveTab, setSelectedComplaintId }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Excessive fees or financial grievances',
    institutionName: 'ABC Institute of Technology',
    institutionCode: 'AICTE-INST-9821',
    institutionLocation: 'Greater Noida, Uttar Pradesh',
    departmentBureau: 'Approval Bureau',
    incidentDate: new Date().toISOString().split('T')[0],
    description: '',
    contactPreference: 'Email'
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  const categories = [
    'Excessive fees or financial grievances',
    'Academic and examination issues',
    'Infrastructure and facilities',
    'Faculty or staff-related grievances',
    'Admission-related issues',
    'Other institutional complaints'
  ];

  const bureaus = [
    'Approval Bureau',
    'Finance & Accounts Bureau',
    'Policy & Academic Planning Bureau',
    'Vigilance & Grievance Cell',
    'Student Welfare Division'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleFileSelect = (files) => {
    const fileList = Array.from(files);
    fileList.forEach(file => {
      const reader = new FileReader();
      const isImg = file.type.startsWith('image/');
      reader.onload = (e) => {
        const newFileObj = {
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
          isImage: isImg,
          url: e.target.result // Base64 data URL previewable directly!
        };
        setUploadedFiles(prev => [...prev, newFileObj]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (indexToRemove) => {
    setUploadedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please provide a specific complaint title and detailed description.');
      return;
    }

    setLoading(true);
    try {
      const docsToSubmit = uploadedFiles.length > 0 ? uploadedFiles : [
        { name: 'Fee_Receipt_Proof.pdf', size: '1.2 MB', url: '#' }
      ];

      const res = await api.submitComplaint({
        ...formData,
        supportingDocuments: docsToSubmit
      });
      setLoading(false);
      if (res.success) {
        setSuccessResult(res);
      } else {
        setError(res.message || 'Submission failed.');
      }
    } catch (err) {
      setLoading(false);
      setError('Network or server error submitting grievance.');
    }
  };

  if (successResult) {
    return (
      <div style={{ maxWidth: '680px', margin: '2rem auto' }}>
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <CheckCircle size={32} color="#059669" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f2b5c' }}>
            Grievance Registered Successfully
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            Your complaint has been logged in the AICTE centralized case-management repository.
          </p>

          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.25rem', margin: '1.5rem 0', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Unique Tracking Reference:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2563eb' }}>{successResult.complaintId}</span>
            </div>
            <div style={{ fontSize: '0.825rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div><strong>Institution:</strong> {formData.institutionName}</div>
              <div><strong>Assigned Initial Bureau:</strong> {formData.departmentBureau}</div>
              <div><strong>Initial Status:</strong> <span className="badge badge-info">Submitted</span></div>
              <div><strong>Uploaded Files:</strong> {uploadedFiles.length} item(s) attached</div>
              <div style={{ marginTop: '0.25rem', padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '4px', color: '#1e40af', fontSize: '0.8rem' }}>
                <strong>Immediate Next Step:</strong> Your complaint is undergoing initial desk screening and bureau categorization.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setSelectedComplaintId(successResult.complaint._id);
                setActiveTab('complaint-detail');
              }}
              className="btn-primary"
            >
              Track Complaint Details
            </button>
            <button
              onClick={() => {
                setSuccessResult(null);
                setUploadedFiles([]);
                setFormData(prev => ({ ...prev, title: '', description: '' }));
              }}
              className="btn-secondary"
            >
              Submit Another Grievance
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FilePlus size={22} color="#0f2b5c" />
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f2b5c' }}>
              Submit Institutional Grievance
            </h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem' }}>
            AICTE Centralized Grievance Redressal Form. Allegations are recorded neutrally for documentary verification.
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '0.375rem', fontSize: '0.825rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Fictional Institution Notice */}
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.375rem', fontSize: '0.775rem', color: '#92400e', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Info size={16} style={{ flexShrink: 0 }} />
            <span>
              <strong>Demo Scenario:</strong> Fictional institution <strong>ABC Institute of Technology</strong> is preselected for standardized hackathon grading. Allegations are considered reported grievances, not established legal conclusions.
            </span>
          </div>

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>
              Complaint Subject / Title <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              className="input-field"
              placeholder="e.g. Unapproved Capitation Fee demanded for Examination Admit Card"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* Category & Bureau Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>
                Complaint Category <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                name="category"
                className="input-field"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>
                Relevant Bureau (if known)
              </label>
              <select
                name="departmentBureau"
                className="input-field"
                value={formData.departmentBureau}
                onChange={handleChange}
              >
                {bureaus.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Institution Details Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>
                Institution Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                name="institutionName"
                required
                className="input-field"
                value={formData.institutionName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>
                AICTE Institution ID
              </label>
              <input
                type="text"
                name="institutionCode"
                className="input-field"
                value={formData.institutionCode}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Incident Date & Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>
                Date of Incident / Notice
              </label>
              <input
                type="date"
                name="incidentDate"
                className="input-field"
                value={formData.incidentDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>
                Institution Location / Campus
              </label>
              <input
                type="text"
                name="institutionLocation"
                className="input-field"
                value={formData.institutionLocation}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>
              Detailed Description of Issue <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              name="description"
              required
              rows={5}
              className="input-field"
              placeholder="State the facts chronologically. E.g., On 15th September, the college accounts desk demanded Rs 15,000 for hall ticket release..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Functional Real Image / Document Upload Area */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>
              Supporting Evidence & Documents
            </label>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*,.pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelect(e.target.files);
                }
              }}
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{
                border: `2px dashed ${isDragging ? '#2563eb' : '#cbd5e1'}`,
                borderRadius: '0.5rem',
                padding: '1.75rem',
                textAlign: 'center',
                backgroundColor: isDragging ? '#eff6ff' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                <Upload size={20} color="#2563eb" />
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>
                Click to browse or drag and drop files here
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                Supports Images (PNG, JPG, JPEG) and Documents (PDF, DOC)
              </div>
            </div>

            {/* Uploaded File Previews */}
            {uploadedFiles.length > 0 && (
              <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Attached Documents ({uploadedFiles.length}):
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {uploadedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.375rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                        {file.isImage ? (
                          <img
                            src={file.url}
                            alt="preview"
                            style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                          />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: '4px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={18} color="#2563eb" />
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {file.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            {file.size}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(idx);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '0.2rem',
                          borderRadius: '4px'
                        }}
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ minWidth: '160px' }}
            >
              {loading ? 'Submitting Grievance...' : 'Submit Grievance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
