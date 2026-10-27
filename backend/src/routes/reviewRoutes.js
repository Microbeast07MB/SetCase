import express from 'express';
import { readCollection, insertOne, findById, updateById } from '../models/dbStore.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { logAudit, createNotification } from '../services/auditService.js';

const router = express.Router();

// GET /api/reviews - Get reviews (Filtered or All for Supervisor)
router.get('/', authenticateToken, (req, res) => {
  const reviews = readCollection('reviews');
  const complaints = readCollection('complaints');

  // Augment reviews with complaint metadata for rich supervisor dashboard
  const enriched = reviews.map(r => {
    const comp = complaints.find(c => c._id === r.complaintMongoId || c.complaintId === r.complaintId);
    return {
      ...r,
      complaintTitle: comp ? comp.title : 'Grievance Review',
      category: comp ? comp.category : 'General',
      institutionName: comp ? comp.institutionName : 'ABC Institute of Technology',
      assignedBureau: comp ? comp.assignedBureau : 'Approval Bureau'
    };
  });

  res.json({
    success: true,
    total: enriched.length,
    reviews: enriched
  });
});

// POST /api/reviews - Submit review after complaint marked resolved
router.post('/', authenticateToken, authorizeRoles('STUDENT'), (req, res) => {
  const {
    complaintId,
    resolvedSatisfaction, // 'Yes' | 'Partially' | 'No'
    rating, // 1 to 5
    difficultiesEncountered, // array of strings
    writtenFeedback,
    reopenRequest
  } = req.body;

  if (!complaintId || !resolvedSatisfaction || !rating) {
    return res.status(400).json({
      success: false,
      message: 'Complaint ID, satisfaction status, and rating are required.'
    });
  }

  const complaints = readCollection('complaints');
  const complaint = complaints.find(c => c.complaintId === complaintId || c._id === complaintId);

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found.' });
  }

  if (complaint.complainantId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Unauthorized to review this complaint.' });
  }

  // Calculate resolution time
  const created = new Date(complaint.createdAt).getTime();
  const now = new Date();
  const diffDays = Math.max(1, Math.round((now.getTime() - created) / (1000 * 60 * 60 * 24)));

  const reviewDoc = {
    complaintId: complaint.complaintId,
    complaintMongoId: complaint._id,
    studentId: req.user.id,
    studentName: req.user.name,
    resolvedSatisfaction,
    rating: Number(rating),
    timeTakenDays: complaint.resolutionDays || diffDays,
    difficultiesEncountered: difficultiesEncountered || [],
    writtenFeedback: writtenFeedback || '',
    reopenRequested: Boolean(reopenRequest && resolvedSatisfaction === 'No'),
    submittedAt: now.toISOString()
  };

  const newReview = insertOne('reviews', reviewDoc);

  // If student says issue was NOT resolved and requests reopen:
  if (reopenRequest && resolvedSatisfaction === 'No') {
    const timeline = [...(complaint.timeline || [])];
    timeline.push({
      stage: 'Under Investigation',
      title: 'Complaint Reopened via Complainant Feedback',
      description: `Complainant reported issue was unresolved: "${writtenFeedback}". Case escalated to bureau supervisor.`,
      actionBy: req.user.name,
      role: 'STUDENT',
      timestamp: now.toISOString()
    });

    updateById('complaints', complaint._id, {
      status: 'Under Investigation',
      nextPendingAction: 'Supervisor re-evaluation following negative complainant feedback',
      lastPublicUpdate: 'Case reopened upon complainant request and escalated for supervisory review.',
      timeline
    });

    createNotification({
      userId: complaint.assignedOfficerId || 'all_supervisors',
      title: `Escalation: Case ${complaint.complaintId} Reopened`,
      message: `Complainant indicated dissatisfaction: "${writtenFeedback}"`,
      complaintId: complaint.complaintId,
      type: 'WARNING'
    });
  } else {
    // If successfully reviewed
    updateById('complaints', complaint._id, {
      complainantSatisfaction: resolvedSatisfaction,
      hasReview: true
    });
  }

  logAudit({
    action: 'RESOLUTION_REVIEW_SUBMITTED',
    complaintId: complaint.complaintId,
    userId: req.user.id,
    userName: req.user.name,
    userRole: req.user.role,
    details: `Rated ${rating}/5, resolved status: ${resolvedSatisfaction}`
  });

  res.status(201).json({
    success: true,
    message: 'Review recorded successfully. Thank you for your feedback.',
    review: newReview
  });
});

export default router;

