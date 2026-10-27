# SetuCase — Bridging Bureaus, Connecting Cases
## AI-Powered Complaint Tracking & Bureau Coordination Platform for AICTE

SetuCase is a centralized institutional complaint tracking and bureau coordination platform engineered for the All India Council for Technical Education (AICTE). It provides end-to-end transparency across grievance lifecycles, cross-departmental case assignment, AI-assisted neutral case summaries, deterministic smart overlap / pattern detection, and post-resolution student satisfaction reviews.

> **Notice:** This is a demonstration prototype for evaluation purposes. The sample institution **"ABC Institute of Technology"** and associated complaints are realistic fictional compliance scenarios. Allegations are considered reported grievances, not established facts.

---

## 🌟 Key Architecture & Features

### 1. Three Distinct Role Workspaces
- **Student / Complainant:**
  - Fast registration & demo sign-in.
  - Structured grievance lodging with automatic unique tracking reference (`SC-YYYY-XXXX`).
  - Real-time progress timeline & plain-language "Next Pending Action" indicator.
  - Ability to submit requested supporting documents when an officer flags "Awaiting Documents".
  - Two-way post-resolution satisfaction reviews with an optional case reopening trigger.
- **Reviewing Officer:**
  - Bureau-specific assigned case registry with priority flags.
  - Confidential officer internal notes (strictly hidden from complainants).
  - Lifecycle state machine transitions (*Submitted*, *Initial Review*, *Awaiting Documents*, *Under Investigation*, *Awaiting Departmental Action*, *Resolved*, *Closed*).
  - AI Smart Overlap Matching: compares cases across institution ID, category, incident proximity, and text overlap. Confirms or rejects duplicate / pattern clusters.
- **Supervisor / Administrator:**
  - Centralized institution analytics derived directly from seeded data.
  - Bureau workload distribution and officer caseload velocity.
  - Overdue grievance escalation queue.
  - Inter-bureau case transfer with mandatory transfer audit reason.
  - System-wide compliance audit log.

### 2. Built-in AI Capabilities
- **Feature 1: One-Line Neutral Case Summary:** Generates a concise, neutral statement including alleged issue, institution involved, current status, and next pending action.
- **Feature 2: Smart Overlap & Pattern Detection:** Transparent scoring algorithm (institution match: 40 pts, category: 25 pts, text similarity: 25 pts, date proximity: 10 pts). Suggested matches (≥ 50%) require explicit human confirmation.

---

## 🚀 Quick Start Instructions

Both the backend and frontend are already running locally on your workstation:
- **Frontend URL:** [http://localhost:3000](http://localhost:3000)
- **Backend API URL:** [http://localhost:5000](http://localhost:5000)

### One-Click Launch (Windows)
Double-click `run-demo.bat` in the project root to start both backend and frontend servers and open your default browser.

### Manual Launch Commands
```powershell
# Set portable Node runtime in PATH (if Node isn't installed globally)
$env:PATH = "E:\SIH project\node-runtime\node-v20.18.0-win-x64;$env:PATH"

# 1. Start Backend (Express API)
cd "E:\SIH project\backend"
node src/server.js

# 2. Start Frontend (React + Vite)
cd "E:\SIH project\frontend"
npx vite --port 3000
```

---

## 🔑 Pre-Configured Demo Accounts

For rapid hackathon evaluation, click any persona on the login screen or sign in with:

| Persona | Role | Email | Password | Bureau / Responsibility |
|---|---|---|---|---|
| **Aarav Sharma** | Student / Complainant | `student@demo.gov.in` | `demo123` | B.Tech Final Year Student |
| **Dr. Rajesh Verma** | Officer | `officer@demo.gov.in` | `demo123` | Approval Bureau Desk |
| **Dr. Sunita Kulkarni** | Officer | `officer2@demo.gov.in` | `demo123` | Finance & Accounts Bureau Desk |
| **Dr. Arvind Mehra** | Supervisor | `supervisor@demo.gov.in` | `demo123` | Central Grievance Cell |

---

## 📋 Hackathon Evaluation Walkthrough Scenario

1. **Student Lodging Grievance:**
   - Sign in as **Aarav Sharma** (`student@demo.gov.in`).
   - Click **"Lodge Grievance"** or **"+ Lodge New Grievance"**.
   - Submit an excessive fee allegation for *ABC Institute of Technology*.
   - A unique tracking ID like `SC-2026-0006` is immediately generated with status `Submitted`.

2. **Officer Inspection & AI Overlap Detection:**
   - Log out and sign in as **Dr. Rajesh Verma** (`officer@demo.gov.in`).
   - Open **Assigned Cases** and select `SC-2026-0001` (Allegation of Unapproved Capitation Fee).
   - Review the AI One-Line Summary.
   - Inspect the **AI Smart Overlap Detection** card: notice the 75% similarity suggestion with `SC-2026-0002` (compulsory lab surcharge at the same institution).
   - Click **"Confirm Relationship"** to establish the systemic pattern in the audit trail.
   - Add a confidential internal note and transition the case status to `Under Investigation`.

3. **Supervisor Coordination & Analytics:**
   - Log out and sign in as **Dr. Arvind Mehra** (`supervisor@demo.gov.in`).
   - Open **Bureau Coordination** to reassign or balance workloads between the Approval Bureau and Finance Bureau.
   - Open **Institutional Analytics** to view the live status distribution, average 6.4-day resolution velocity, and overdue SLA queues.
   - Inspect the **Compliance Audit Trail** to verify all role actions are immutably logged.

4. **Resolution Feedback:**
   - View **Resolution Reviews** to inspect student satisfaction ratings and difficulties reported post-resolution.

---

## 📂 Project Structure

```
SIH project/
├── backend/
│   ├── data/                 # Persistent local JSON data store (users, complaints, reviews, audit)
│   ├── src/
│   │   ├── middleware/       # JWT auth & role authorization
│   │   ├── models/           # Persistent store handlers
│   │   ├── routes/           # Auth, Complaints, Reviews, Analytics, Notifications, Audit routes
│   │   ├── services/         # Deterministic AI summarization & overlap scoring engine
│   │   ├── seed.js           # Realistic hackathon demonstration dataset
│   │   └── server.js         # Express server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # MainLayout & navigation shell
│   │   ├── context/          # AuthContext for session management
│   │   ├── pages/            # 10 Role-specific views & dashboards
│   │   ├── services/         # Axios/Fetch API client
│   │   ├── App.jsx
│   │   └── index.css         # Gov-Tech design system styles
│   ├── vite.config.js
│   └── package.json
├── node-runtime/             # Self-contained Node.js v20 runtime
├── run-demo.bat              # One-click launcher script
└── README.md
```

