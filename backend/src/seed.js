import bcrypt from 'bcryptjs';
import { readCollection, writeCollection } from './models/dbStore.js';
import { generateOneLineSummary } from './services/aiService.js';

export function seedDatabase() {
  const existingUsers = readCollection('users');
  if (existingUsers && existingUsers.length > 0) {
    console.log('Database already populated. Skipping full seed.');
    return;
  }

  console.log('Seeding SetuCase prototype database with realistic scenario data...');

  // 1. SEED USERS (Three distinct roles)
  const defaultPasswordHash = bcrypt.hashSync('demo123', 10);

  const users = [
    {
      _id: 'usr_student_01',
      name: 'Aarav Sharma',
      email: 'student@demo.gov.in',
      password: defaultPasswordHash,
      role: 'STUDENT',
      phone: '+91 98765 43210',
      institutionName: 'ABC Institute of Technology',
      designation: 'B.Tech Student (Final Year)',
      isDemo: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      _id: 'usr_officer_01',
      name: 'Dr. Rajesh Verma',
      email: 'officer@demo.gov.in',
      password: defaultPasswordHash,
      role: 'OFFICER',
      phone: '+91 91234 56789',
      bureau: 'Approval Bureau',
      designation: 'Senior Inspection & Grievance Officer',
      isDemo: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      _id: 'usr_officer_02',
      name: 'Dr. Sunita Kulkarni',
      email: 'officer2@demo.gov.in',
      password: defaultPasswordHash,
      role: 'OFFICER',
      phone: '+91 94321 09876',
      bureau: 'Finance & Accounts Bureau',
      designation: 'Financial Audit & Compliance Officer',
      isDemo: true,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    {
      _id: 'usr_supervisor_01',
      name: 'Dr. Arvind Mehra',
      email: 'supervisor@demo.gov.in',
      password: defaultPasswordHash,
      role: 'SUPERVISOR',
      phone: '+91 99887 76655',
      bureau: 'AICTE Central Grievance Cell',
      designation: 'Chief Vigilance & Grievance Supervisor',
      isDemo: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    }
  ];
  writeCollection('users', users);

  // 2. SEED COMPLAINTS
  // Fictional institution: ABC Institute of Technology
  // Highlighting realistic scenarios (Excessive fees, infrastructure, faculty)
  const now = new Date();
  const subDays = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();
  const addDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

  const complaints = [
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
      description: 'Reported concern regarding lack of working terminal computers in 4th floor IT Lab and non-functioning fire extinguishers in academic block B.',
      contactPreference: 'Email',
      status: 'Awaiting Departmental Action',
      priority: 'Urgent',
      nextPendingAction: 'Physical Surprise Inspection Bureau Order',
      lastPublicUpdate: 'Case forwarded to Regional Office Inspection Roster.',
      complainantId: 'usr_student_03_seed',
      complainantName: 'Vikas Kumar',
      complainantEmail: 'vikas.k@yahoo.com',
      dueDate: subDays(2), // Overdue!
      createdAt: subDays(25),
      updatedAt: subDays(5),
      supportingDocuments: [
        { name: 'Lab_Photos.pdf', size: '4.8 MB', url: '#' }
      ],
      timeline: [
        {
          stage: 'Submitted',
          title: 'Complaint Logged',
          description: 'Complainant uploaded photographs of unserviced equipment.',
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
        },
        {
          stage: 'Awaiting Departmental Action',
          title: 'Escalated to Infrastructure Committee',
          description: 'Awaiting formal surprise inspection panel composition.',
          actionBy: 'Dr. Arvind Mehra',
          role: 'SUPERVISOR',
          timestamp: subDays(5)
        }
      ],
      internalNotes: [
        {
          author: 'Dr. Arvind Mehra',
          role: 'SUPERVISOR',
          note: 'Requires immediate dispatch of Regional Committee inspection team before winter semester.',
          timestamp: subDays(5)
        }
      ],
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
      description: 'Grievance submitted claiming college refused to surrender original class 12th certificates and bachelor transcripts without payment of voluntary alumni endowment.',
      contactPreference: 'Email',
      status: 'Resolved',
      priority: 'High',
      nextPendingAction: 'Case concluded and complainant feedback captured',
      lastPublicUpdate: 'Institute refunded fee and handed over original certificates under AICTE regional observer presence.',
      complainantId: 'usr_student_01',
      complainantName: 'Aarav Sharma',
      complainantEmail: 'student@demo.gov.in',
      dueDate: subDays(10),
      createdAt: subDays(45),
      resolvedAt: subDays(12),
      resolutionDays: 14,
      updatedAt: subDays(12),
      supportingDocuments: [
        { name: 'Original_Retention_Letter.pdf', size: '1.2 MB', url: '#' },
        { name: 'Handover_Handwritten_Memo.pdf', size: '650 KB', url: '#' }
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
          stage: 'Under Investigation',
          title: 'Executive Notice Dispatched',
          description: 'Strict notice issued citing AICTE Approval Process Handbook Clause 6.1.',
          actionBy: 'Dr. Rajesh Verma',
          role: 'OFFICER',
          timestamp: subDays(32)
        },
        {
          stage: 'Resolved',
          title: 'Compliance Verified & Rectified',
          description: 'Certificates surrendered to complainant with documented receipt.',
          actionBy: 'Dr. Rajesh Verma',
          role: 'OFFICER',
          timestamp: subDays(12)
        }
      ],
      internalNotes: [],
      relatedMatches: []
    },
    {
      _id: 'comp_005',
      complaintId: 'SC-2026-0005',
      title: 'Shortfall of Required Cadre Ratio in Department of Computer Science',
      category: 'Faculty or staff-related grievances',
      institutionName: 'ABC Institute of Technology',
      institutionCode: 'AICTE-INST-9821',
      institutionLocation: 'Greater Noida, Uttar Pradesh',
      assignedBureau: 'Approval Bureau',
      assignedOfficerId: 'usr_officer_01',
      assignedOfficerName: 'Dr. Rajesh Verma',
      incidentDate: '2026-10-01',
      description: 'Reported shortage of designated Professors and Associate Professors in Computer Engineering division as mandated by AICTE 1:20 teacher-student ratio norms.',
      contactPreference: 'Email',
      status: 'Awaiting Documents',
      priority: 'Normal',
      nextPendingAction: 'Faculty roster and biometric attendance records from institute',
      lastPublicUpdate: 'Directives issued to furnish current roster verified by Registrar.',
      complainantId: 'usr_student_05_seed',
      complainantName: 'Priya Iyer',
      complainantEmail: 'priya.i@example.com',
      dueDate: addDays(8),
      createdAt: subDays(6),
      updatedAt: subDays(2),
      supportingDocuments: [
        { name: 'Department_Timetable.pdf', size: '920 KB', url: '#' }
      ],
      timeline: [
        {
          stage: 'Submitted',
          title: 'Complaint Registered',
          description: 'Grievance submitted regarding faculty vacancy.',
          actionBy: 'Priya Iyer',
          role: 'STUDENT',
          timestamp: subDays(6)
        },
        {
          stage: 'Awaiting Documents',
          title: 'Document Call Issued',
          description: 'Summoned official faculty roster with qualifications and biometric records.',
          actionBy: 'Dr. Rajesh Verma',
          role: 'OFFICER',
          timestamp: subDays(2)
        }
      ],
      internalNotes: [],
      relatedMatches: []
    }
  ];

  // Generate AI one-line summaries for all complaints
  complaints.forEach(c => {
    c.oneLineSummary = generateOneLineSummary(c);
  });

  writeCollection('complaints', complaints);

  // 3. SEED RESOLUTION REVIEW
  const reviews = [
    {
      _id: 'rev_001',
      complaintId: 'SC-2026-0004',
      complaintMongoId: 'comp_004',
      studentId: 'usr_student_01',
      studentName: 'Aarav Sharma',
      resolvedSatisfaction: 'Yes',
      rating: 5,
      timeTakenDays: 14,
      difficultiesEncountered: [
        'Initial response delay from institution'
      ],
      writtenFeedback: 'AICTE officer Dr. Rajesh Verma intervened decisively. The institute handed over my degree certificates without further illegal fee deduction.',
      reopenRequested: false,
      submittedAt: subDays(10)
    }
  ];
  writeCollection('reviews', reviews);

  // 4. SEED NOTIFICATIONS
  const notifications = [
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
      _id: 'notif_002',
      userId: 'usr_student_01',
      title: 'Resolution Review Completed',
      message: 'Thank you for rating the resolution for Case SC-2026-0004.',
      complaintId: 'SC-2026-0004',
      type: 'SUCCESS',
      read: true,
      createdAt: subDays(10)
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
    },
    {
      _id: 'notif_004',
      userId: 'all_supervisors',
      title: 'Overdue Grievance Escalation: SC-2026-0003',
      message: 'Physical inspection scheduling has exceeded the 20-day threshold.',
      complaintId: 'SC-2026-0003',
      type: 'WARNING',
      read: false,
      createdAt: subDays(1)
    }
  ];
  writeCollection('notifications', notifications);

  // 5. SEED AUDIT LOGS
  const auditLogs = [
    {
      _id: 'audit_001',
      action: 'SYSTEM_SEEDED',
      complaintId: 'SYSTEM',
      userId: 'usr_supervisor_01',
      userName: 'Dr. Arvind Mehra',
      userRole: 'SUPERVISOR',
      details: 'System initialized with AICTE prototype seed records for ABC Institute of Technology scenario.',
      timestamp: subDays(45)
    },
    {
      _id: 'audit_002',
      action: 'COMPLAINT_SUBMITTED',
      complaintId: 'SC-2026-0001',
      userId: 'usr_student_01',
      userName: 'Aarav Sharma',
      userRole: 'STUDENT',
      details: 'Grievance submitted alleging unauthorized fee demands.',
      timestamp: subDays(14)
    },
    {
      _id: 'audit_003',
      action: 'STATUS_UPDATED',
      complaintId: 'SC-2026-0001',
      userId: 'usr_officer_01',
      userName: 'Dr. Rajesh Verma',
      userRole: 'OFFICER',
      details: 'Status transitioned from Initial Review to Under Investigation.',
      timestamp: subDays(4)
    }
  ];
  writeCollection('auditLogs', auditLogs);

  console.log('Database seeded successfully with prototype scenario!');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}

