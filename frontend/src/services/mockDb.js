/**
 * Client-Side In-Memory & LocalStorage Mock Database for GitHub Pages
 * Allows the entire prototype to run 100% serverless on GitHub Pages!
 */

const STORAGE_KEY_PREFIX = 'setucase_store_';

const initialUsers = [
  {
    _id: 'usr_student_01',
    name: 'Aarav Sharma',
    email: 'student@demo.gov.in',
    role: 'STUDENT',
    phone: '+91 98765 43210',
    institutionName: 'ABC Institute of Technology',
    designation: 'B.Tech Student (Final Year)',
    isDemo: true
  },
  {
    _id: 'usr_officer_01',
    name: 'Dr. Rajesh Verma',
    email: 'officer@demo.gov.in',
    role: 'OFFICER',
    phone: '+91 91234 56789',
    bureau: 'Approval Bureau',
    designation: 'Senior Inspection & Grievance Officer',
    isDemo: true
  },
  {
    _id: 'usr_officer_02',
    name: 'Dr. Sunita Kulkarni',
    email: 'officer2@demo.gov.in',
    role: 'OFFICER',
    phone: '+91 94321 09876',
    bureau: 'Finance & Accounts Bureau',
    designation: 'Financial Audit & Compliance Officer',
    isDemo: true
  },
  {
    _id: 'usr_supervisor_01',
    name: 'Dr. Arvind Mehra',
    email: 'supervisor@demo.gov.in',
    role: 'SUPERVISOR',
    phone: '+91 99887 76655',
    bureau: 'AICTE Central Grievance Cell',
    designation: 'Chief Vigilance & Grievance Supervisor',
    isDemo: true
  }
];

const now = new Date();
const subDays = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();
const addDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

const initialComplaints = [
  {
    _id: 'comp_001',
    complaintId: 'SC-2026-0001',
    title: 'Allegation of Unapproved Capitation Fee for Examination Hall Tickets',
    category: 'Excessive fees or financial grievances',
    institutionName: 'ABC Institute of Technology',
    institutionCode: 'AICTE-INST-9821',
    institutionLocation: 'Greater Noida, Uttar Pradesh',
    assignedBureau: 'Approval Bureau',
    assignedOfficerId: 'usr_officer_01',
    assignedOfficerName: 'Dr. Rajesh Verma',
    incidentDate: '2026-09-15',
    description: 'Reported grievance by final-year students alleging that the administration at ABC Institute of Technology is withholding semester examination admit cards demanding an unauthorized Rs 15,000 "Campus Development Cess", which is not approved under AICTE Fee Regulatory Committee guidelines.',
    contactPreference: 'Email',
    status: 'Under Investigation',
    priority: 'High',
    nextPendingAction: 'Formal response review from ABC Institute Management',
    lastPublicUpdate: 'Bureau sent inquiry letter to institute registrar requesting fee audit statements.',
    complainantId: 'usr_student_01',
    complainantName: 'Aarav Sharma',
    complainantEmail: 'student@demo.gov.in',
    dueDate: addDays(4),
    createdAt: subDays(14),
    updatedAt: subDays(1),
    oneLineSummary: 'Reported excessive fees (Allegation of Unapproved Capitation Fee...) at ABC Institute of Technology; currently under investigation and awaiting formal response review. [AI-Assisted]',
    supportingDocuments: [
      { name: 'Fee_Demand_Notice_Circular.pdf', size: '1.4 MB', url: '#' },
      { name: 'Payment_Receipt_Compulsion.pdf', size: '840 KB', url: '#' }
    ],
    timeline: [
      {
        stage: 'Submitted',
        title: 'Complaint Registered',
        description: 'Grievance lodged online with fee demand receipts attached.',
        actionBy: 'Aarav Sharma',
        role: 'STUDENT',
        timestamp: subDays(14)
      },
      {
        stage: 'Initial Review',
        title: 'Document Validation',
        description: 'Initial scrutiny confirmed non-standard fee head in circular.',
        actionBy: 'Dr. Rajesh Verma',
        role: 'OFFICER',
        timestamp: subDays(11)
      },
      {
        stage: 'Assigned to Bureau',
        title: 'Assigned to Approval Bureau',
        description: 'Forwarded for compliance verification against statutory approval handbook.',
        actionBy: 'Dr. Arvind Mehra',
        role: 'SUPERVISOR',
        timestamp: subDays(9)
      },
      {
        stage: 'Under Investigation',
        title: 'Explanation Demanded from College',
        description: 'Formal summons notice dispatched to College Governing Board with 7-day SLA.',
        actionBy: 'Dr. Rajesh Verma',
        role: 'OFFICER',
        timestamp: subDays(4)
      }
    ],
    internalNotes: [
      {
        author: 'Dr. Rajesh Verma',
        role: 'OFFICER',
        note: 'Similar reports received from two other departments of ABC Institute. Potential systemic fee compliance breach.',
        timestamp: subDays(8)
      }
    ],
    relatedMatches: []
  },
  {
    _id: 'comp_002',
    complaintId: 'SC-2026-0002',
    title: 'Reported Mandatory Laboratory Development Surcharge on 3rd Year Students',
    category: 'Excessive fees or financial grievances',
    institutionName: 'ABC Institute of Technology',
    institutionCode: 'AICTE-INST-9821',
    institutionLocation: 'Greater Noida, Uttar Pradesh',
    assignedBureau: 'Approval Bureau',
    assignedOfficerId: 'usr_officer_01',
    assignedOfficerName: 'Dr. Rajesh Verma',
    incidentDate: '2026-09-18',
    description: 'Allegation submitted regarding compulsory demand of Rs 12,500 laboratory fee at ABC Institute of Technology prior to practical session admittance.',
    contactPreference: 'Phone',
    status: 'Initial Review',
    priority: 'High',
    nextPendingAction: 'Cross-verification with Fee Committee Schedule',
    lastPublicUpdate: 'Case logged; undergoing documentary comparison.',
    complainantId: 'usr_student_02_seed',
    complainantName: 'Neha Deshmukh',
    complainantEmail: 'neha.d@gmail.com',
    dueDate: addDays(6),
    createdAt: subDays(9),
    updatedAt: subDays(2),
    oneLineSummary: 'Reported fee grievance (Mandatory Laboratory Surcharge) at ABC Institute of Technology; currently initial review and awaiting verification. [AI-Assisted]',
    supportingDocuments: [
      { name: 'Lab_Fee_Challan.pdf', size: '1.1 MB', url: '#' }
    ],
    timeline: [
      {
        stage: 'Submitted',
        title: 'Complaint Registered',
        description: 'Case registered by complainant.',
        actionBy: 'Neha Deshmukh',
        role: 'STUDENT',
        timestamp: subDays(9)
      },
      {
        stage: 'Initial Review',
        title: 'Initial Scrutiny',
        description: 'Reviewing against state fee regulatory committee tariff.',
        actionBy: 'Dr. Rajesh Verma',
        role: 'OFFICER',
        timestamp: subDays(2)
      }
    ],
    internalNotes: [],
    relatedMatches: []
  },
  {
    _id: 'comp_003',
    complaintId: 'SC-2026-0003',
    title: 'Alleged Sub-Standard Computer Lab Hardware and Inoperative Fire Safety Measures',
    category: 'Infrastructure and facilities',
    institutionName: 'ABC Institute of Technology',
    institutionCode: 'AICTE-INST-9821',
    institutionLocation: 'Greater Noida, Uttar Pradesh',
    assignedBureau: 'Approval Bureau',
    assignedOfficerId: 'usr_officer_01',
    assignedOfficerName: 'Dr. Rajesh Verma',
    incidentDate: '2026-08-10',
    description: 'Reported concern regarding lack of working terminal computers in IT Lab and non-functioning fire safety apparatus.',
    contactPreference: 'Email',
    status: 'Awaiting Departmental Action',
    priority: 'Urgent',
    nextPendingAction: 'Physical Surprise Inspection Bureau Order',
    lastPublicUpdate: 'Case forwarded to Regional Office Inspection Roster.',
    complainantId: 'usr_student_03_seed',
    complainantName: 'Vikas Kumar',
    complainantEmail: 'vikas.k@yahoo.com',
    dueDate: subDays(2),
    createdAt: subDays(25),
    updatedAt: subDays(5),
    oneLineSummary: 'Reported infrastructure issue (Lab Hardware and Fire Safety) at ABC Institute of Technology; currently awaiting departmental action. [AI-Assisted]',
    supportingDocuments: [
      { name: 'Lab_Photos.pdf', size: '4.8 MB', url: '#' }
    ],
    timeline: [
      {
        stage: 'Submitted',
        title: 'Complaint Logged',
        description: 'Complainant uploaded photographs of equipment.',
        actionBy: 'Vikas Kumar',
        role: 'STUDENT',
        timestamp: subDays(25)
      },
      {
        stage: 'Under Investigation',
        title: 'Notice Served',
        description: 'Notice served to Director ABC Institute.',
        actionBy: 'Dr. Rajesh Verma',
        role: 'OFFICER',
        timestamp: subDays(15)
      }
    ],
    internalNotes: [],
    relatedMatches: []
  },
  {
    _id: 'comp_004',
    complaintId: 'SC-2026-0004',
    title: 'Withholding of Original Degree Certificates Pending Unofficial Alumni Contribution',
    category: 'Academic and examination issues',
    institutionName: 'ABC Institute of Technology',
    institutionCode: 'AICTE-INST-9821',
    institutionLocation: 'Greater Noida, Uttar Pradesh',
    assignedBureau: 'Approval Bureau',
    assignedOfficerId: 'usr_officer_01',
    assignedOfficerName: 'Dr. Rajesh Verma',
    incidentDate: '2026-07-20',
    description: 'Grievance submitted claiming college refused to surrender original class 12th certificates without voluntary alumni endowment.',
    contactPreference: 'Email',
    status: 'Resolved',
    priority: 'High',
    nextPendingAction: 'Case concluded and complainant feedback captured',
    lastPublicUpdate: 'Institute refunded fee and handed over original certificates.',
    complainantId: 'usr_student_01',
    complainantName: 'Aarav Sharma',
    complainantEmail: 'student@demo.gov.in',
    dueDate: subDays(10),
    createdAt: subDays(45),
    resolvedAt: subDays(12),
    resolutionDays: 14,
    hasReview: true,
    updatedAt: subDays(12),
    oneLineSummary: 'Reported academic issue (Degree Certificate Retention) at ABC Institute of Technology; resolved successfully with certificates returned. [AI-Assisted]',
    supportingDocuments: [
      { name: 'Original_Retention_Letter.pdf', size: '1.2 MB', url: '#' }
    ],
    timeline: [
      {
        stage: 'Submitted',
        title: 'Complaint Lodged',
        description: 'Student submitted application.',
        actionBy: 'Aarav Sharma',
        role: 'STUDENT',
        timestamp: subDays(45)
      },
      {
        stage: 'Resolved',
        title: 'Certificates Handed Over',
        description: 'College returned documents following AICTE order.',
        actionBy: 'Dr. Rajesh Verma',
        role: 'OFFICER',
        timestamp: subDays(12)
      }
    ],
    internalNotes: [],
    relatedMatches: []
  }
];

const initialReviews = [
  {
    _id: 'rev_001',
    complaintId: 'SC-2026-0004',
    complaintMongoId: 'comp_004',
    studentId: 'usr_student_01',
    studentName: 'Aarav Sharma',
    resolvedSatisfaction: 'Yes',
    rating: 5,
    timeTakenDays: 14,
    difficultiesEncountered: ['Initial response delay from institution'],
    writtenFeedback: 'AICTE officer Dr. Rajesh Verma intervened decisively. The institute handed over my degree certificates without further illegal fee deduction.',
    reopenRequested: false,
    submittedAt: subDays(10)
  }
];

const initialNotifications = [
  {
    _id: 'notif_001',
    userId: 'usr_student_01',
    title: 'Case SC-2026-0001 Update',
    message: 'Formal response demanded from college governing body regarding fee complaint.',
    complaintId: 'SC-2026-0001',
    type: 'INFO',
    read: false,
    createdAt: subDays(4)
  },
  {
    _id: 'notif_003',
    userId: 'usr_officer_01',
    title: 'Related Case Overlap Alert',
    message: 'AI Similarity Engine detected 75% overlap between SC-2026-0001 and SC-2026-0002 at ABC Institute.',
    complaintId: 'SC-2026-0001',
    type: 'INFO',
    read: false,
    createdAt: subDays(2)
  }
];

const initialAuditLogs = [
  {
    _id: 'audit_001',
    action: 'SYSTEM_INITIALIZED',
    complaintId: 'SYSTEM',
    userName: 'Dr. Arvind Mehra',
    userRole: 'SUPERVISOR',
    details: 'System initialized with AICTE prototype seed records for ABC Institute of Technology.',
    timestamp: subDays(45)
  }
];

function getStored(key, fallback) {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(data);
  } catch (e) {
    return fallback;
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(val));
  } catch (e) {}
}

export const mockDb = {
  getUsers: () => getStored('users', initialUsers),
  getComplaints: () => getStored('complaints', initialComplaints),
  saveComplaints: (data) => setStored('complaints', data),
  getReviews: () => getStored('reviews', initialReviews),
  saveReviews: (data) => setStored('reviews', data),
  getNotifications: () => getStored('notifications', initialNotifications),
  saveNotifications: (data) => setStored('notifications', data),
  getAuditLogs: () => getStored('auditLogs', initialAuditLogs),
  saveAuditLogs: (data) => setStored('auditLogs', data)
};

