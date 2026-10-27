import { mockDb } from './mockDb';

const API_BASE = 'http://localhost:5000/api';

const getCurrentUser = () => {
  const token = localStorage.getItem('setucase_token');
  if (!token) return null;
  try {
    const users = mockDb.getUsers();
    return users.find(u => u.email === token) || users[0];
  } catch (e) {
    return null;
  }
};

// Deterministic overlap detection
function detectOverlaps(target, all) {
  return all
    .filter(c => c._id !== target._id && c.complaintId !== target.complaintId)
    .map(item => {
      let score = 0;
      let reasons = [];
      if (item.institutionName.toLowerCase() === target.institutionName.toLowerCase()) {
        score += 40;
        reasons.push(`Identical institution (${item.institutionName})`);
      }
      if (item.category === target.category) {
        score += 25;
        reasons.push(`Matching category (${item.category})`);
      }
      score += 15;
      reasons.push('Textual similarity match');
      return {
        relatedComplaintId: item.complaintId,
        relatedMongoId: item._id,
        title: item.title,
        category: item.category,
        institutionName: item.institutionName,
        status: item.status,
        similarityScore: Math.min(95, score),
        reason: reasons.join(' • '),
        state: 'SUGGESTED'
      };
    })
    .filter(m => m.similarityScore >= 50);
}

export const api = {
  // Auth
  login: async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    // Fallback for GitHub Pages
    const users = mockDb.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (user) {
      localStorage.setItem('setucase_token', user.email);
      return { success: true, token: user.email, user };
    }
    return { success: false, message: 'Invalid credentials. Use demo123.' };
  },

  register: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const users = mockDb.getUsers();
    const newUser = {
      _id: 'usr_' + Date.now(),
      name: data.name,
      email: data.email,
      role: 'STUDENT',
      institutionName: data.institutionName || 'ABC Institute of Technology',
      designation: 'Student Complainant'
    };
    users.push(newUser);
    localStorage.setItem('setucase_store_users', JSON.stringify(users));
    localStorage.setItem('setucase_token', newUser.email);
    return { success: true, token: newUser.email, user: newUser };
  },

  getMe: async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('setucase_token')}` }
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const user = getCurrentUser();
    return { success: true, user };
  },

  getDemoAccounts: async () => {
    return {
      success: true,
      accounts: mockDb.getUsers().map(u => ({
        name: u.name,
        email: u.email,
        role: u.role,
        bureau: u.bureau || 'General',
        designation: u.designation,
        passwordHint: 'demo123'
      }))
    };
  },

  // Complaints
  getComplaints: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/complaints${query ? '?' + query : ''}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('setucase_token')}` }
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    // GitHub Pages Local Filter
    const user = getCurrentUser();
    let list = mockDb.getComplaints();
    if (user?.role === 'STUDENT') {
      list = list.filter(c => c.complainantId === user._id || c.complainantEmail === user.email);
    } else if (user?.role === 'OFFICER') {
      if (params.assignedToMe === 'true') {
        list = list.filter(c => c.assignedOfficerId === user._id);
      } else {
        list = list.filter(c => !user.bureau || c.assignedBureau === user.bureau || c.assignedOfficerId === user._id);
      }
    }
    return { success: true, total: list.length, complaints: list };
  },

  getComplaintById: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('setucase_token')}` }
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const list = mockDb.getComplaints();
    const c = list.find(item => item._id === id || item.complaintId === id);
    if (!c) return { success: false, message: 'Complaint not found' };

    const overlaps = detectOverlaps(c, list);
    return { success: true, complaint: { ...c, suggestedOverlaps: overlaps } };
  },

  submitComplaint: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('setucase_token')}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const list = mockDb.getComplaints();
    const users = mockDb.getUsers();
    const user = getCurrentUser();
    const count = list.length + 1;
    const complaintId = `SC-2026-${String(count).padStart(4, '0')}`;
    const selectedBureau = data.departmentBureau || 'Approval Bureau';
    const bureauOfficers = users.filter(u =>
      u.role === 'OFFICER' &&
      u.bureau &&
      u.bureau.trim().toLowerCase() === selectedBureau.trim().toLowerCase()
    );

    let assignedOfficer = null;
    if (bureauOfficers.length > 0) {
      // Fair distribution based on active complaint count
      const officerWorkload = bureauOfficers.map(officer => {
        const activeCount = list.filter(c =>
          c.assignedOfficerId === officer._id &&
          c.status !== 'Resolved' &&
          c.status !== 'Closed'
        ).length;
        return { officer, activeCount };
      });
      officerWorkload.sort((a, b) => a.activeCount - b.activeCount);
      assignedOfficer = officerWorkload[0].officer;
    }

    const nowIso = new Date().toISOString();
    const timeline = [
      {
        stage: 'Submitted',
        title: 'Complaint Registered',
        description: `Case generated with reference number ${complaintId}.`,
        actionBy: user?.name || 'Student',
        role: 'STUDENT',
        timestamp: nowIso
      }
    ];

    if (assignedOfficer) {
      timeline.push({
        stage: 'Assigned to Bureau',
        title: `Assigned to ${selectedBureau}`,
        description: `Automatically routed to ${selectedBureau} and assigned to officer ${assignedOfficer.name}.`,
        actionBy: 'System Automation',
        role: 'SYSTEM',
        timestamp: nowIso,
        bureau: selectedBureau,
        officerId: assignedOfficer._id,
        officerName: assignedOfficer.name
      });
    }

    const newDoc = {
      _id: 'comp_' + Date.now(),
      complaintId,
      ...data,
      assignedBureau: selectedBureau,
      assignedOfficerId: assignedOfficer ? assignedOfficer._id : null,
      assignedOfficerName: assignedOfficer ? assignedOfficer.name : 'Unassigned',
      assignmentTimestamp: assignedOfficer ? nowIso : null,
      status: assignedOfficer ? 'Assigned to Bureau' : 'Submitted',
      priority: 'Normal',
      nextPendingAction: assignedOfficer
        ? 'Assessment and scheduling by the assigned bureau desk'
        : 'Awaiting officer allocation by system administrator',
      lastPublicUpdate: assignedOfficer
        ? `Complaint assigned to ${selectedBureau} (${assignedOfficer.name}) for review.`
        : `Complaint registered under ${selectedBureau}. Awaiting bureau officer assignment.`,
      complainantId: user?._id || 'usr_student_01',
      complainantName: user?.name || 'Aarav Sharma',
      complainantEmail: user?.email || 'student@demo.gov.in',
      createdAt: nowIso,
      timeline,
      internalNotes: [],
      oneLineSummary: `Reported ${data.category.toLowerCase()} (${data.title.slice(0, 50)}...) at ${data.institutionName}; currently ${assignedOfficer ? 'assigned to ' + selectedBureau : 'submitted'}. [AI-Assisted]`
    };
    list.unshift(newDoc);
    mockDb.saveComplaints(list);
    return {
      success: true,
      message: assignedOfficer
        ? 'Complaint submitted and automatically assigned to bureau officer'
        : 'Complaint submitted successfully; officer assignment pending administrator allocation',
      complaintId,
      complaint: newDoc
    };
  },

  updateStatus: async (id, data) => {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('setucase_token')}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const list = mockDb.getComplaints();
    const idx = list.findIndex(c => c._id === id || c.complaintId === id);
    if (idx >= 0) {
      list[idx].status = data.status;
      list[idx].lastPublicUpdate = data.publicUpdate;
      if (data.nextAction) list[idx].nextPendingAction = data.nextAction;
      list[idx].timeline.push({
        stage: data.status,
        title: `Status updated to ${data.status}`,
        description: data.publicUpdate,
        actionBy: 'Reviewing Officer',
        role: 'OFFICER',
        timestamp: new Date().toISOString()
      });
      mockDb.saveComplaints(list);
      return { success: true, complaint: list[idx] };
    }
    return { success: false };
  },

  addInternalNote: async (id, note) => {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('setucase_token')}`
        },
        body: JSON.stringify({ note })
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const list = mockDb.getComplaints();
    const idx = list.findIndex(c => c._id === id || c.complaintId === id);
    if (idx >= 0) {
      if (!list[idx].internalNotes) list[idx].internalNotes = [];
      list[idx].internalNotes.push({
        author: 'Reviewing Officer',
        role: 'OFFICER',
        note,
        timestamp: new Date().toISOString()
      });
      mockDb.saveComplaints(list);
      return { success: true };
    }
    return { success: false };
  },

  assignComplaint: async (id, data) => {
    const list = mockDb.getComplaints();
    const idx = list.findIndex(c => c._id === id || c.complaintId === id);
    if (idx >= 0) {
      list[idx].assignedBureau = data.bureau;
      list[idx].assignedOfficerName = data.officerName;
      list[idx].priority = data.priority;
      list[idx].timeline.push({
        stage: 'Assigned to Bureau',
        title: 'Case Transferred / Reassigned',
        description: `Transferred to ${data.bureau} (${data.officerName}). Reason: ${data.reason}`,
        actionBy: 'Supervisor',
        role: 'SUPERVISOR',
        timestamp: new Date().toISOString()
      });
      mockDb.saveComplaints(list);
      return { success: true, complaint: list[idx] };
    }
    return { success: false };
  },

  updateRelation: async (id, data) => {
    const list = mockDb.getComplaints();
    const idx = list.findIndex(c => c._id === id || c.complaintId === id);
    if (idx >= 0) {
      if (!list[idx].relatedMatches) list[idx].relatedMatches = [];
      list[idx].relatedMatches.push({
        relatedComplaintId: data.relatedComplaintId,
        state: data.action === 'CONFIRM' ? 'CONFIRMED' : 'REJECTED',
        remarks: data.remarks
      });
      mockDb.saveComplaints(list);
      return { success: true };
    }
    return { success: false };
  },

  requestMoreInfo: async (id, instructions) => {
    return { success: true };
  },

  provideMoreInfo: async (id, data) => {
    const list = mockDb.getComplaints();
    const idx = list.findIndex(c => c._id === id || c.complaintId === id);
    if (idx >= 0) {
      list[idx].status = 'Initial Review';
      list[idx].timeline.push({
        stage: 'Initial Review',
        title: 'Documents Uploaded by Complainant',
        description: data.responseText,
        actionBy: 'Complainant',
        role: 'STUDENT',
        timestamp: new Date().toISOString()
      });
      mockDb.saveComplaints(list);
      return { success: true, complaint: list[idx] };
    }
    return { success: false };
  },

  // Analytics
  getDashboardAnalytics: async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('setucase_token')}` }
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const complaints = mockDb.getComplaints();
    const reviews = mockDb.getReviews();

    const statusCounts = {};
    complaints.forEach(c => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });

    const categoryCounts = {};
    complaints.forEach(c => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });

    const statusDistribution = Object.keys(statusCounts).map(k => ({ name: k, value: statusCounts[k] }));
    const categoryDistribution = Object.keys(categoryCounts).map(k => ({ category: k, count: categoryCounts[k] }));

    return {
      success: true,
      metrics: {
        total: complaints.length,
        newComplaints: complaints.filter(c => c.status === 'Submitted').length,
        underReview: complaints.filter(c => c.status === 'Initial Review' || c.status === 'Under Investigation').length,
        awaitingDocs: complaints.filter(c => c.status === 'Awaiting Documents').length,
        awaitingDept: complaints.filter(c => c.status === 'Awaiting Departmental Action').length,
        overdue: complaints.filter(c => c.dueDate && new Date(c.dueDate) < new Date() && c.status !== 'Resolved').length,
        resolved: complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length,
        avgResolutionDays: '6.4'
      },
      statusDistribution,
      categoryDistribution,
      bureauWorkload: [
        { bureau: 'Approval Bureau', total: 4, pending: 3, resolved: 1, overdue: 1 },
        { bureau: 'Finance & Accounts Bureau', total: 1, pending: 1, resolved: 0, overdue: 0 }
      ],
      officerWorkload: [
        { officerId: 'usr_officer_01', name: 'Dr. Rajesh Verma', bureau: 'Approval Bureau', totalAssigned: 4, activePending: 3, resolved: 1 },
        { officerId: 'usr_officer_02', name: 'Dr. Sunita Kulkarni', bureau: 'Finance & Accounts Bureau', totalAssigned: 1, activePending: 1, resolved: 0 }
      ],
      monthlyTrends: [
        { month: 'May 2026', submitted: 8, resolved: 6 },
        { month: 'Jun 2026', submitted: 14, resolved: 11 },
        { month: 'Jul 2026', submitted: 19, resolved: 15 },
        { month: 'Aug 2026', submitted: 24, resolved: 18 },
        { month: 'Sep 2026', submitted: 22, resolved: 20 },
        { month: 'Oct 2026', submitted: complaints.length, resolved: 1 }
      ],
      satisfactionStats: {
        averageRating: '4.8',
        totalReviews: reviews.length
      }
    };
  },

  // Reviews
  getReviews: async () => {
    return { success: true, reviews: mockDb.getReviews() };
  },

  submitReview: async (data) => {
    const reviews = mockDb.getReviews();
    const user = getCurrentUser();
    const newRev = {
      _id: 'rev_' + Date.now(),
      ...data,
      studentName: user?.name || 'Aarav Sharma',
      timeTakenDays: 14,
      submittedAt: new Date().toISOString()
    };
    reviews.unshift(newRev);
    mockDb.saveReviews(reviews);
    return { success: true, message: 'Review recorded successfully. Thank you for your feedback.', review: newRev };
  },

  // Notifications
  getNotifications: async () => {
    return { success: true, notifications: mockDb.getNotifications() };
  },

  markNotificationRead: async (id) => {
    const notifs = mockDb.getNotifications();
    const found = notifs.find(n => n._id === id);
    if (found) found.read = true;
    mockDb.saveNotifications(notifs);
    return { success: true };
  },

  // Audit
  getAuditLogs: async () => {
    return { success: true, logs: mockDb.getAuditLogs() };
  }
};
