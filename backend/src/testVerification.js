/**
 * Automated Verification Script for SetuCase
 * Tests:
 * 1. Successful complaint registration & automatic officer assignment
 * 2. Assigned officer belongs to the selected bureau
 * 3. Complaint appears in the correct officer dashboard (bureau isolation)
 * 4. Student sees correct status ("Assigned to Bureau") and officer information
 * 5. Bureau with no configured officer remains in safe unassigned state
 * 6. Invalid bureau validation
 * 7. Unauthorized cross-bureau access restriction
 * 8. Status transition compatibility (e.g. Under Investigation -> Resolved)
 */

import jwt from 'jsonwebtoken';
import { readCollection, insertOne, removeById } from '../src/models/dbStore.js';

const JWT_SECRET = process.env.JWT_SECRET || 'setucase_super_secret_jwt_key_2026_demo';

function makeToken(user) {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bureau: user.bureau || null
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

async function runTests() {
  const users = readCollection('users');
  const student = users.find(u => u.role === 'STUDENT');
  const officerApproval = users.find(u => u.role === 'OFFICER' && u.bureau === 'Approval Bureau');
  const officerFinance = users.find(u => u.role === 'OFFICER' && u.bureau === 'Finance & Accounts Bureau');

  console.log('Testing users found:');
  console.log(`- Student: ${student.name} (${student._id})`);
  console.log(`- Officer (Approval): ${officerApproval.name} (${officerApproval._id})`);
  console.log(`- Officer (Finance): ${officerFinance.name} (${officerFinance._id})`);

  const studentToken = makeToken(student);
  const approvalOfficerToken = makeToken(officerApproval);
  const financeOfficerToken = makeToken(officerFinance);

  const BASE_URL = 'http://localhost:5000/api';

  // Helper for requests
  async function api(endpoint, method = 'GET', body = null, token = studentToken) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (body) headers['Content-Type'] = 'application/json';

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    const json = await res.json();
    return { status: res.status, ok: res.ok, body: json };
  }

  let createdComplaintIds = [];

  try {
    console.log('\n--- Test 1: Register complaint with Approval Bureau ---');
    const comp1Res = await api('/complaints', 'POST', {
      title: 'Test Fee Overcharge Notice',
      category: 'Excessive fees or financial grievances',
      institutionName: 'ABC Institute of Technology',
      departmentBureau: 'Approval Bureau',
      description: 'Demanding unauthorized fee surcharge without committee clearance.'
    }, studentToken);

    if (!comp1Res.ok || !comp1Res.body.success) {
      throw new Error(`Failed to create comp1: ${JSON.stringify(comp1Res.body)}`);
    }

    const c1 = comp1Res.body.complaint;
    createdComplaintIds.push(c1._id);
    console.log(`✓ Complaint registered: ID=${c1.complaintId}, Status="${c1.status}"`);
    if (c1.status !== 'Assigned to Bureau') throw new Error(`Expected status "Assigned to Bureau", got "${c1.status}"`);
    if (c1.assignedBureau !== 'Approval Bureau') throw new Error(`Expected bureau "Approval Bureau", got "${c1.assignedBureau}"`);
    if (c1.assignedOfficerId !== officerApproval._id) throw new Error(`Expected officer ID ${officerApproval._id}, got ${c1.assignedOfficerId}`);
    if (c1.assignedOfficerName !== officerApproval.name) throw new Error(`Expected officer Name ${officerApproval.name}, got ${c1.assignedOfficerName}`);
    console.log(`✓ Automatically assigned to officer: ${c1.assignedOfficerName} (${c1.assignedOfficerId})`);

    // Verify timeline
    const timelineStages = c1.timeline.map(t => t.stage);
    if (!timelineStages.includes('Submitted') || !timelineStages.includes('Assigned to Bureau')) {
      throw new Error(`Timeline missing required events: ${JSON.stringify(c1.timeline)}`);
    }
    console.log(`✓ Timeline has both 'Submitted' and 'Assigned to Bureau' entries.`);

    console.log('\n--- Test 2: Register complaint with Finance & Accounts Bureau ---');
    const comp2Res = await api('/complaints', 'POST', {
      title: 'Discrepancy in Scholarship Reimbursement Ledger',
      category: 'Excessive fees or financial grievances',
      institutionName: 'ABC Institute of Technology',
      departmentBureau: 'Finance & Accounts Bureau',
      description: 'Scholarship subsidy sanctioned by ministry was not credited to institutional ledger.'
    }, studentToken);

    if (!comp2Res.ok || !comp2Res.body.success) {
      throw new Error(`Failed to create comp2: ${JSON.stringify(comp2Res.body)}`);
    }
    const c2 = comp2Res.body.complaint;
    createdComplaintIds.push(c2._id);
    console.log(`✓ Complaint registered: ID=${c2.complaintId}, Status="${c2.status}"`);
    if (c2.assignedOfficerId !== officerFinance._id) throw new Error(`Expected officer ID ${officerFinance._id}, got ${c2.assignedOfficerId}`);
    if (c2.assignedOfficerName !== officerFinance.name) throw new Error(`Expected officer Name ${officerFinance.name}, got ${c2.assignedOfficerName}`);
    console.log(`✓ Automatically assigned to Finance officer: ${c2.assignedOfficerName}`);

    console.log('\n--- Test 3: Officer Dashboard & RBAC Isolation ---');
    // Approval officer lists complaints
    const approvalList = await api('/complaints', 'GET', null, approvalOfficerToken);
    const approvalIds = approvalList.body.complaints.map(c => c._id);
    if (!approvalIds.includes(c1._id)) throw new Error('Approval officer cannot see their assigned complaint c1');
    if (approvalIds.includes(c2._id)) throw new Error('Approval officer can see Finance complaint c2 (breach of bureau isolation)');
    console.log(`✓ Approval officer sees c1 but does NOT see c2.`);

    // Finance officer lists complaints
    const financeList = await api('/complaints', 'GET', null, financeOfficerToken);
    const financeIds = financeList.body.complaints.map(c => c._id);
    if (!financeIds.includes(c2._id)) throw new Error('Finance officer cannot see their assigned complaint c2');
    if (financeIds.includes(c1._id)) throw new Error('Finance officer can see Approval complaint c1 (breach of bureau isolation)');
    console.log(`✓ Finance officer sees c2 but does NOT see c1.`);

    console.log('\n--- Test 4: Detail view RBAC restriction ---');
    // Finance officer attempts to fetch c1 details directly
    const crossAccess = await api(`/complaints/${c1._id}`, 'GET', null, financeOfficerToken);
    if (crossAccess.status !== 403) {
      throw new Error(`Expected 403 for cross-bureau detail fetch, got ${crossAccess.status}`);
    }
    console.log(`✓ Cross-bureau detail access correctly denied with 403 Forbidden.`);

    // Approval officer fetches c1 details
    const validAccess = await api(`/complaints/${c1._id}`, 'GET', null, approvalOfficerToken);
    if (!validAccess.ok) throw new Error('Approval officer could not access c1 details');
    console.log(`✓ Bureau officer can access their own bureau complaint details.`);

    // Student fetches c1 details
    const studentAccess = await api(`/complaints/${c1._id}`, 'GET', null, studentToken);
    if (!studentAccess.ok) throw new Error('Student could not access their own complaint details');
    if (studentAccess.body.complaint.status !== 'Assigned to Bureau') throw new Error('Student does not see "Assigned to Bureau" status');
    if (studentAccess.body.complaint.assignedOfficerName !== officerApproval.name) throw new Error('Student does not see assigned officer name');
    console.log(`✓ Student sees reference ID=${studentAccess.body.complaint.complaintId}, status="Assigned to Bureau", officer="${studentAccess.body.complaint.assignedOfficerName}".`);

    console.log('\n--- Test 5: Missing officer handling (Student Welfare Division) ---');
    const comp3Res = await api('/complaints', 'POST', {
      title: 'Hostel Mess Sanitation Complaint',
      category: 'Infrastructure and facilities',
      institutionName: 'ABC Institute of Technology',
      departmentBureau: 'Student Welfare Division',
      description: 'Hostel mess drinking water filtration unit out of order.'
    }, studentToken);

    if (!comp3Res.ok) throw new Error(`Failed to submit unassigned bureau complaint: ${JSON.stringify(comp3Res.body)}`);
    const c3 = comp3Res.body.complaint;
    createdComplaintIds.push(c3._id);
    if (c3.status !== 'Submitted') throw new Error(`Expected unassigned status to remain "Submitted", got "${c3.status}"`);
    if (c3.assignedOfficerId !== null) throw new Error(`Expected null officer ID, got ${c3.assignedOfficerId}`);
    if (c3.assignedOfficerName !== 'Unassigned') throw new Error(`Expected "Unassigned" officer name, got ${c3.assignedOfficerName}`);
    console.log(`✓ Bureau with no configured officer preserved safe unassigned status="Submitted" and officer="Unassigned".`);

    console.log('\n--- Test 6: Invalid bureau validation ---');
    const invalidBureauRes = await api('/complaints', 'POST', {
      title: 'Invalid Bureau Grievance',
      category: 'Academic and examination issues',
      institutionName: 'ABC Institute of Technology',
      departmentBureau: 'NonExistentFakeBureau',
      description: 'Testing validation rejection for unknown bureau.'
    }, studentToken);

    if (invalidBureauRes.status !== 400) {
      throw new Error(`Expected 400 Bad Request for invalid bureau, got ${invalidBureauRes.status}`);
    }
    console.log(`✓ Invalid bureau rejected with 400 Bad Request: "${invalidBureauRes.body.message}".`);

    console.log('\n--- Test 7: Subsequent status transition workflow ---');
    const transitionRes = await api(`/complaints/${c1._id}/status`, 'PATCH', {
      status: 'Under Investigation',
      publicUpdate: 'Officer commenced preliminary document examination.'
    }, approvalOfficerToken);

    if (!transitionRes.ok) throw new Error(`Status transition failed: ${JSON.stringify(transitionRes.body)}`);
    if (transitionRes.body.complaint.status !== 'Under Investigation') {
      throw new Error(`Expected status "Under Investigation", got "${transitionRes.body.complaint.status}"`);
    }
    console.log(`✓ Status transitioned smoothly from "Assigned to Bureau" to "Under Investigation".`);

    console.log('\n========================================');
    console.log(' ALL 7 VERIFICATION SUITES PASSED! ✓');
    console.log('========================================');
  } finally {
    // Clean up test complaints
    for (const id of createdComplaintIds) {
      removeById('complaints', id);
    }
    console.log(`\nCleaned up ${createdComplaintIds.length} test complaint(s).`);
  }
}

runTests().catch(err => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
