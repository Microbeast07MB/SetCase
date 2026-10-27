import express from 'express';
import {
  readCollection,
  insertOne,
  findById,
  updateById
} from '../models/dbStore.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { generateOneLineSummary, detectRelatedComplaints } from '../services/aiService.js';
import { logAudit, createNotification } from '../services/auditService.js';

const router = express.Router();

// Helper to generate reference ID SC-YYYY-XXXX
function generateReferenceId() {
  const year = new Date().getFullYear();
  const complaints = readCollection('complaints');
  const count = complaints.length + 1;
  const pad = String(count).padStart(4, '0');
  return `SC-${year}-${pad}`;
}

// Map of default next actions based on status
const NEXT_ACTIONS = {
  'Submitted': 'Initial screening and bureau categorization',
  'Initial Review': 'Verification of complaint allegations and document inspection',
  'Awaiting Documents': 'Submission of requested supporting records by complainant',
  'Assigned to Bureau': 'Assessment and scheduling by the assigned bureau desk',
  'Under Investigation': 'Detailed examination and gathering institutional response',
  'Awaiting Departmental Action': 'Formal directive review by technical/approval council',
  'Resolved': 'Complainant satisfaction review and audit sign-off',
  'Closed': 'Case concluded and archived in permanent register'
};

// GET /api/complaints - List complaints filtered by role and query
router.get('/', authenticateToken, (req, res) => {
  const all = readCollection('complaints');
  const { role, id: userId, bureau } = req.user;
  const { status, category, bureau: filterBureau, search, assignedToMe, isOverdue } = req.query;

  let filtered = [...all];

  // 1. Role boundary isolation
  if (role === 'STUDENT') {
    // Complainant sees ONLY their own complaints
    filtered = filtered.filter(c => c.complainantId === userId);
  } else if (role === 'OFFICER') {
    // Officer sees complaints assigned to them, or to their bureau
    if (assignedToMe === 'true') {
      filtered = filtered.filter(c => c.assignedOfficerId === userId);
    } else {
      // Bureau visibility
      filtered = filtered.filter(c => !bureau || c.assignedBureau === bureau || c.assignedOfficerId === userId);
    }
  }
  // SUPERVISOR sees all

  // 2. Query filters
  if (status) {
    filtered = filtered.filter(c => c.status.toLowerCase() === status.toLowerCase());
  }
  if (category) {
    filtered = filtered.filter(c => c.category.toLowerCase() === category.toLowerCase());
  }
  if (filterBureau) {
    filtered = filtered.filter(c => c.assignedBureau && c.assignedBureau.toLowerCase() === filterBureau.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(c =>
      (c.complaintId && c.complaintId.toLowerCase().includes(q)) ||
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.institutionName && c.institutionName.toLowerCase().includes(q)) ||
      (c.category && c.category.toLowerCase().includes(q))
    );
  }
  if (isOverdue === 'true') {
    const now = new Date();
    filtered = filtered.filter(c =>
      c.status !== 'Resolved' &&
      c.status !== 'Closed' &&
      c.dueDate &&
      new Date(c.dueDate) < now
    );
  }

  // Sanitize for STUDENT role (strip internal notes)
  if (role === 'STUDENT') {
    filtered = filtered.map(c => {
      const { internalNotes, officerActionLogs, relatedCandidates, ...safeC } = c;
      return safeC;
    });
  }

  res.json({
    success: true,
    total: filtered.length,
    complaints: filtered
  });
});

// GET /api/complaints/:id - Get detailed complaint
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { role, id: userId, bureau } = req.user;

  const all = readCollection('complaints');
  const complaint = all.find(c => c._id === id || c.complaintId === id);

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  // Check role authorization
  if (role === 'STUDENT' && complaint.complainantId !== userId) {
    return res.status(403).json({ success: false, message: 'Access denied: You can only view your own complaints.' });
  }

  if (role === 'OFFICER') {
    const isAssignedToOfficer = complaint.assignedOfficerId === userId;
    const isBureauMatch = Boolean(bureau && complaint.assignedBureau && complaint.assignedBureau.trim().toLowerCase() === bureau.trim().toLowerCase());
    if (!isAssignedToOfficer && !isBureauMatch) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only access complaints within your bureau or assigned to you.' });
    }
  }

  // If Student, strip sensitive internal fields
  if (role === 'STUDENT') {
    const { internalNotes, officerActionLogs, relatedCandidates, ...studentSafe } = complaint;
    return res.json({ success: true, complaint: studentSafe });
  }

  // AI Assistance: dynamically refresh suggested matches if officer or supervisor
  const relatedMatches = detectRelatedComplaints(complaint, all);
  // Merge existing confirmed/rejected states
  const existingMatches = complaint.relatedMatches || [];
  const mergedMatches = relatedMatches.map(m => {
    const existing = existingMatches.find(em => em.relatedComplaintId === m.relatedComplaintId);
    if (existing) {
      return { ...m, state: existing.state, officerRemarks: existing.officerRemarks };
    }
    return m;
  });

  res.json({
    success: true,
    complaint: {
      ...complaint,
      suggestedOverlaps: mergedMatches
    }
  });
});

// Configured bureaus
const CONFIGURED_BUREAUS = [
  'Approval Bureau',
  'Finance & Accounts Bureau',
  'Policy & Academic Planning Bureau',
  'Vigilance & Grievance Cell',
  'Student Welfare Division'
];

// Helper to select an eligible officer for a bureau using fair distribution
function selectEligibleOfficer(bureauName) {
  if (!bureauName) return null;
  const users = readCollection('users');
  const bureauOfficers = users.filter(u =>
    u.role === 'OFFICER' &&
    u.bureau &&
    u.bureau.trim().toLowerCase() === bureauName.trim().toLowerCase()
  );

  if (bureauOfficers.length === 0) {
    return null;
  }

  if (bureauOfficers.length === 1) {
    return bureauOfficers[0];
  }

  // Fair distribution: find officer with fewest active (pending) complaints
  const complaints = readCollection('complaints');
  const officerWorkload = bureauOfficers.map(officer => {
    const activeCount = complaints.filter(c =>
      c.assignedOfficerId === officer._id &&
      c.status !== 'Resolved' &&
      c.status !== 'Closed'
    ).length;
    return { officer, activeCount };
  });

  officerWorkload.sort((a, b) => a.activeCount - b.activeCount);
  return officerWorkload[0].officer;
}

// POST /api/complaints - Submit new complaint (Student)
router.post('/', authenticateToken, authorizeRoles('STUDENT', 'SUPERVISOR'), (req, res) => {
  const {
    title,
    category,
    institutionName,
    institutionCode,
    institutionLocation,
    departmentBureau,
    incidentDate,
    description,
    contactPreference,
    supportingDocuments
  } = req.body;

  if (!title || !category || !institutionName || !description) {
    return res.status(400).json({
      success: false,
      message: 'Title, category, institution name, and description are required.'
    });
  }

  // Validate bureau against configured bureaus
  const selectedBureau = (departmentBureau && departmentBureau.trim()) || 'Approval Bureau';
  const isValidBureau = CONFIGURED_BUREAUS.some(
    b => b.toLowerCase() === selectedBureau.toLowerCase()
  );
  if (!isValidBureau) {
    return res.status(400).json({
      success: false,
      message: `Invalid bureau selected: "${departmentBureau}". Must be one of: ${CONFIGURED_BUREAUS.join(', ')}`
    });
  }

  // Canonicalize bureau name from configured list
  const canonicalBureau = CONFIGURED_BUREAUS.find(
    b => b.toLowerCase() === selectedBureau.toLowerCase()
  ) || selectedBureau;

  // Find eligible officer for the selected bureau
  const assignedOfficer = selectEligibleOfficer(canonicalBureau);

  const complaintId = generateReferenceId();
  const now = new Date();
  const nowIso = now.toISOString();
  // 15 days SLA target demo review target
  const dueDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString();

  // Initial timeline entry for registration
  const timeline = [
    {
      stage: 'Submitted',
      title: 'Complaint Registered',
      description: `Case generated with reference number ${complaintId}. Acknowledgment dispatched.`,
      actionBy: req.user.name,
      role: req.user.role,
      timestamp: nowIso
    }
  ];

  let initialStatus = 'Submitted';
  let assignedOfficerId = null;
  let assignedOfficerName = 'Unassigned';
  let assignmentTimestamp = null;
  let lastPublicUpdate = 'Complaint registered and assigned unique reference number for review.';
  let nextPendingAction = NEXT_ACTIONS['Submitted'];

  if (assignedOfficer) {
    initialStatus = 'Assigned to Bureau';
    assignedOfficerId = assignedOfficer._id;
    assignedOfficerName = assignedOfficer.name;
    assignmentTimestamp = nowIso;
    lastPublicUpdate = `Complaint assigned to ${canonicalBureau} (${assignedOfficer.name}) for review.`;
    nextPendingAction = NEXT_ACTIONS['Assigned to Bureau'];

    // Timeline entry for automatic bureau & officer assignment
    timeline.push({
      stage: 'Assigned to Bureau',
      title: `Assigned to ${canonicalBureau}`,
      description: `Automatically routed to ${canonicalBureau} and assigned to officer ${assignedOfficer.name}.`,
      actionBy: 'System Automation',
      role: 'SYSTEM',
      timestamp: nowIso,
      bureau: canonicalBureau,
      officerId: assignedOfficer._id,
      officerName: assignedOfficer.name
    });
  } else {
    // No eligible officer configured for this bureau
    lastPublicUpdate = `Complaint registered under ${canonicalBureau}. Awaiting administrator assignment of bureau officer.`;
    nextPendingAction = 'Awaiting officer allocation by system administrator';
  }

  const preliminaryDoc = {
    complaintId,
    title: title.trim(),
    category,
    institutionName: institutionName.trim(),
    institutionCode: institutionCode || 'AICTE-INST-9821',
    institutionLocation: institutionLocation || 'New Delhi, India',
    assignedBureau: canonicalBureau,
    assignedOfficerId,
    assignedOfficerName,
    assignmentTimestamp,
    incidentDate: incidentDate || new Date().toISOString().split('T')[0],
    description: description.trim(),
    contactPreference: contactPreference || 'Email',
    supportingDocuments: supportingDocuments || [
      { name: 'Fee_Receipt_Proof.pdf', size: '1.2 MB', url: '#' },
      { name: 'Application_Copy.pdf', size: '540 KB', url: '#' }
    ],
    status: initialStatus,
    priority: 'Normal',
    nextPendingAction,
    lastPublicUpdate,
    complainantId: req.user.id,
    complainantName: req.user.name,
    complainantEmail: req.user.email,
    dueDate,
    timeline,
    internalNotes: [],
    officerActionLogs: [],
    relatedMatches: []
  };

  // Generate One-line AI summary
  preliminaryDoc.oneLineSummary = generateOneLineSummary(preliminaryDoc);

  const newComplaint = insertOne('complaints', preliminaryDoc);

  logAudit({
    action: 'COMPLAINT_SUBMITTED',
    complaintId,
    userId: req.user.id,
    userName: req.user.name,
    userRole: req.user.role,
    details: `Complaint submitted for institution ${institutionName}. Bureau: ${canonicalBureau}`
  });

  if (assignedOfficer) {
    logAudit({
      action: 'CASE_ASSIGNMENT_CHANGED',
      complaintId,
      userId: 'SYSTEM',
      userName: 'SetuCase Automated Dispatcher',
      userRole: 'SYSTEM',
      details: `Complaint automatically assigned to bureau "${canonicalBureau}" and officer "${assignedOfficer.name}" (${assignedOfficer._id})`
    });

    // Notify assigned officer
    createNotification({
      userId: assignedOfficer._id,
      title: 'New Complaint Assigned',
      message: `Case ${complaintId} (${title.trim()}) has been assigned to your bureau desk.`,
      complaintId,
      type: 'INFO'
    });
  }

  createNotification({
    userId: req.user.id,
    title: 'Complaint Filed Successfully',
    message: assignedOfficer
      ? `Your grievance ${complaintId} has been registered and assigned to ${assignedOfficer.name} (${canonicalBureau}).`
      : `Your grievance ${complaintId} has been registered under ${canonicalBureau}. Officer assignment pending.`,
    complaintId,
    type: 'SUCCESS'
  });

  res.status(201).json({
    success: true,
    message: assignedOfficer
      ? 'Complaint submitted and automatically assigned to bureau officer'
      : 'Complaint submitted successfully; officer assignment pending administrator allocation',
    complaintId,
    complaint: newComplaint
  });
});

// PATCH /api/complaints/:id/status - Update Status (Officer / Supervisor)
router.patch('/:id/status', authenticateToken, authorizeRoles('OFFICER', 'SUPERVISOR'), (req, res) => {
  const { id } = req.params;
  const { status, publicUpdate, internalNote, nextAction } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required.' });
  }

  const complaint = findById('complaints', id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found.' });
  }

  const now = new Date().toISOString();
  const updatedTimeline = [...(complaint.timeline || [])];
  
  const stageUpdate = {
    stage: status,
    title: `Status updated to ${status}`,
    description: publicUpdate || `Officer recorded progress: ${status}`,
    actionBy: req.user.name,
    role: req.user.role,
    timestamp: now
  };
  updatedTimeline.push(stageUpdate);

  const updatedNotes = [...(complaint.internalNotes || [])];
  if (internalNote) {
    updatedNotes.push({
      author: req.user.name,
      role: req.user.role,
      note: internalNote,
      timestamp: now
    });
  }

  const updates = {
    status,
    nextPendingAction: nextAction || NEXT_ACTIONS[status] || complaint.nextPendingAction,
    lastPublicUpdate: publicUpdate || `Complaint status updated to ${status}`,
    timeline: updatedTimeline,
    internalNotes: updatedNotes
  };

  if (status === 'Resolved') {
    updates.resolvedAt = now;
    // Calculate resolution hours/days
    const createdTime = new Date(complaint.createdAt).getTime();
    const resolvedTime = new Date(now).getTime();
    updates.resolutionDays = Math.max(1, Math.round((resolvedTime - createdTime) / (1000 * 60 * 60 * 24)));
  }

  // Refresh AI summary with new status
  updates.oneLineSummary = generateOneLineSummary({ ...complaint, ...updates });

  const updatedComplaint = updateById('complaints', id, updates);

  logAudit({
    action: 'STATUS_UPDATED',
    complaintId: complaint.complaintId,
    userId: req.user.id,
    userName: req.user.name,
    userRole: req.user.role,
    details: `Changed status from '${complaint.status}' to '${status}'`
  });

  // Notify Student
  createNotification({
    userId: complaint.complainantId,
    title: `Update on Case ${complaint.complaintId}`,
    message: publicUpdate || `Your complaint status has changed to ${status}.`,
    complaintId: complaint.complaintId,
    type: status === 'Resolved' ? 'SUCCESS' : 'INFO'
  });

  res.json({
    success: true,
    message: `Status updated to ${status}`,
    complaint: updatedComplaint
  });
});

// POST /api/complaints/:id/notes - Add internal note (Officer / Supervisor)
router.post('/:id/notes', authenticateToken, authorizeRoles('OFFICER', 'SUPERVISOR'), (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  if (!note || !note.trim()) {
    return res.status(400).json({ success: false, message: 'Note text cannot be empty.' });
  }

  const complaint = findById('complaints', id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found.' });
  }

  const now = new Date().toISOString();
  const notes = [...(complaint.internalNotes || [])];
  notes.push({
    author: req.user.name,
    role: req.user.role,
    note: note.trim(),
    timestamp: now
  });

  updateById('complaints', id, { internalNotes: notes });

  logAudit({
    action: 'INTERNAL_NOTE_ADDED',
    complaintId: complaint.complaintId,
    userId: req.user.id,
    userName: req.user.name,
    userRole: req.user.role,
    details: 'Added internal confidential investigation note'
  });

  res.json({
    success: true,
    message: 'Internal note added successfully',
    notes
  });
});

// POST /api/complaints/:id/assign - Assign or forward to bureau/officer (Officer / Supervisor)
router.post('/:id/assign', authenticateToken, authorizeRoles('OFFICER', 'SUPERVISOR'), (req, res) => {
  const { id } = req.params;
  const { bureau, officerId, officerName, priority, reason } = req.body;

  const complaint = findById('complaints', id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found.' });
  }

  const now = new Date().toISOString();
  const oldBureau = complaint.assignedBureau;
  const oldOfficer = complaint.assignedOfficerName;

  const timeline = [...(complaint.timeline || [])];
  timeline.push({
    stage: 'Assigned to Bureau',
    title: 'Case Transferred / Assigned',
    description: `Assigned to Bureau: [${bureau || oldBureau}] Officer: [${officerName || 'Designated Bureau Officer'}]. Reason: ${reason || 'Workload distribution'}`,
    actionBy: req.user.name,
    role: req.user.role,
    timestamp: now
  });

  const updates = {
    assignedBureau: bureau || complaint.assignedBureau,
    assignedOfficerId: officerId !== undefined ? officerId : complaint.assignedOfficerId,
    assignedOfficerName: officerName || complaint.assignedOfficerName,
    priority: priority || complaint.priority,
    status: complaint.status === 'Submitted' ? 'Assigned to Bureau' : complaint.status,
    nextPendingAction: `Review and evaluation by ${officerName || bureau || 'Bureau Desk'}`,
    timeline
  };

  updates.oneLineSummary = generateOneLineSummary({ ...complaint, ...updates });

  const updated = updateById('complaints', id, updates);

  logAudit({
    action: 'CASE_ASSIGNMENT_CHANGED',
    complaintId: complaint.complaintId,
    userId: req.user.id,
    userName: req.user.name,
    userRole: req.user.role,
    details: `Transferred from [${oldBureau} / ${oldOfficer}] to [${bureau} / ${officerName}]. Transfer reason: ${reason}`
  });

  res.json({
    success: true,
    message: 'Case assignment updated successfully',
    complaint: updated
  });
});

// POST /api/complaints/:id/relation - Confirm or Reject suggested match (Officer / Supervisor)
router.post('/:id/relation', authenticateToken, authorizeRoles('OFFICER', 'SUPERVISOR'), (req, res) => {
  const { id } = req.params;
  const { relatedComplaintId, action, remarks } = req.body; // action: 'CONFIRM' | 'REJECT'

  if (!relatedComplaintId || !['CONFIRM', 'REJECT'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Invalid action or missing related complaint ID.' });
  }

  const complaint = findById('complaints', id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found.' });
  }

  const now = new Date().toISOString();
  const existingMatches = complaint.relatedMatches || [];
  const idx = existingMatches.findIndex(m => m.relatedComplaintId === relatedComplaintId);

  const updatedState = action === 'CONFIRM' ? 'CONFIRMED' : 'REJECTED';
  const entry = {
    relatedComplaintId,
    state: updatedState,
    decidedBy: req.user.name,
    decidedAt: now,
    officerRemarks: remarks || (action === 'CONFIRM' ? 'Confirmed as duplicate/pattern complaint.' : 'Reviewed and rejected as unrelated.')
  };

  if (idx >= 0) {
    existingMatches[idx] = { ...existingMatches[idx], ...entry };
  } else {
    existingMatches.push(entry);
  }

  // Also add timeline note
  const timeline = [...(complaint.timeline || [])];
  timeline.push({
    stage: 'Under Investigation',
    title: `AI Match Suggestion ${updatedState}`,
    description: `Officer ${req.user.name} reviewed connection with ${relatedComplaintId}: marked as ${updatedState}. Notes: ${entry.officerRemarks}`,
    actionBy: req.user.name,
    role: req.user.role,
    timestamp: now
  });

  const updated = updateById('complaints', id, {
    relatedMatches: existingMatches,
    timeline
  });

  logAudit({
    action: action === 'CONFIRM' ? 'RELATION_CONFIRMED' : 'RELATION_REJECTED',
    complaintId: complaint.complaintId,
    userId: req.user.id,
    userName: req.user.name,
    userRole: req.user.role,
    details: `${updatedState} relationship with ${relatedComplaintId}`
  });

  res.json({
    success: true,
    message: `Suggested relation has been ${updatedState.toLowerCase()}`,
    complaint: updated
  });
});

// POST /api/complaints/:id/request-info - Request missing info from student
router.post('/:id/request-info', authenticateToken, authorizeRoles('OFFICER', 'SUPERVISOR'), (req, res) => {
  const { id } = req.params;
  const { instructions } = req.body;

  const complaint = findById('complaints', id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found.' });
  }

  const now = new Date().toISOString();
  const timeline = [...(complaint.timeline || [])];
  timeline.push({
    stage: 'Awaiting Documents',
    title: 'Additional Documentation Requested',
    description: instructions || 'Please furnish official fee challan and university identity card.',
    actionBy: req.user.name,
    role: req.user.role,
    timestamp: now
  });

  const updates = {
    status: 'Awaiting Documents',
    nextPendingAction: 'Complainant document submission required',
    lastPublicUpdate: instructions || 'Additional supporting documentation requested by officer.',
    timeline
  };
  updates.oneLineSummary = generateOneLineSummary({ ...complaint, ...updates });

  const updated = updateById('complaints', id, updates);

  createNotification({
    userId: complaint.complainantId,
    title: 'Action Required: Additional Documents Requested',
    message: instructions || 'The reviewing officer has requested supplementary documents for your case.',
    complaintId: complaint.complaintId,
    type: 'WARNING'
  });

  res.json({
    success: true,
    message: 'Request sent to complainant',
    complaint: updated
  });
});

// POST /api/complaints/:id/provide-info - Complainant replies with info/docs
router.post('/:id/provide-info', authenticateToken, authorizeRoles('STUDENT'), (req, res) => {
  const { id } = req.params;
  const { responseText, documents } = req.body;

  const complaint = findById('complaints', id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found.' });
  }

  if (complaint.complainantId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const now = new Date().toISOString();
  const timeline = [...(complaint.timeline || [])];
  timeline.push({
    stage: 'Initial Review',
    title: 'Complainant Furnished Supplementary Information',
    description: responseText || 'Requested documents uploaded by complainant.',
    actionBy: req.user.name,
    role: req.user.role,
    timestamp: now
  });

  const existingDocs = complaint.supportingDocuments || [];
  const newDocs = documents || [{ name: 'Supplementary_Evidence.pdf', size: '820 KB', url: '#' }];

  const updates = {
    status: 'Initial Review',
    nextPendingAction: 'Officer verification of newly submitted evidence',
    lastPublicUpdate: 'Complainant provided requested information. Resuming review.',
    supportingDocuments: [...existingDocs, ...newDocs],
    timeline
  };
  updates.oneLineSummary = generateOneLineSummary({ ...complaint, ...updates });

  const updated = updateById('complaints', id, updates);

  logAudit({
    action: 'INFO_PROVIDED_BY_STUDENT',
    complaintId: complaint.complaintId,
    userId: req.user.id,
    userName: req.user.name,
    userRole: req.user.role,
    details: 'Complainant submitted requested documentation'
  });

  res.json({
    success: true,
    message: 'Information submitted successfully to officer',
    complaint: updated
  });
});

export default router;

