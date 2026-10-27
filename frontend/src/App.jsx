import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { MainLayout } from './components/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { SubmitComplaintPage } from './pages/SubmitComplaintPage';
import { MyComplaintsPage } from './pages/MyComplaintsPage';
import { ComplaintDetailPage } from './pages/ComplaintDetailPage';
import { OfficerCasesPage } from './pages/OfficerCasesPage';
import { SmartOverlapPage } from './pages/SmartOverlapPage';
import { BureauCoordinationPage } from './pages/BureauCoordinationPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ResolutionReviewsPage } from './pages/ResolutionReviewsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a1b3a', color: '#ffffff' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>SetuCase AICTE</h2>
          <p style={{ color: '#93c5fd', fontSize: '0.85rem', marginTop: '0.5rem' }}>Initializing institutional session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage setActiveTab={setActiveTab} setSelectedComplaintId={setSelectedComplaintId} />;
      case 'submit':
        return <SubmitComplaintPage setActiveTab={setActiveTab} setSelectedComplaintId={setSelectedComplaintId} />;
      case 'my-complaints':
        return <MyComplaintsPage setActiveTab={setActiveTab} setSelectedComplaintId={setSelectedComplaintId} />;
      case 'complaint-detail':
        return <ComplaintDetailPage complaintId={selectedComplaintId} setActiveTab={setActiveTab} setSelectedComplaintId={setSelectedComplaintId} />;
      case 'officer-cases':
        return <OfficerCasesPage setActiveTab={setActiveTab} setSelectedComplaintId={setSelectedComplaintId} />;
      case 'smart-overlap':
        return <SmartOverlapPage setActiveTab={setActiveTab} setSelectedComplaintId={setSelectedComplaintId} />;
      case 'bureau-coordination':
        return <BureauCoordinationPage setActiveTab={setActiveTab} setSelectedComplaintId={setSelectedComplaintId} />;
      case 'analytics':
        return <AnalyticsPage setActiveTab={setActiveTab} setSelectedComplaintId={setSelectedComplaintId} />;
      case 'resolution-reviews':
        return <ResolutionReviewsPage setActiveTab={setActiveTab} setSelectedComplaintId={setSelectedComplaintId} />;
      case 'notifications-page':
        return <NotificationsPage setActiveTab={setActiveTab} setSelectedComplaintId={setSelectedComplaintId} />;
      case 'audit-logs':
        return <AuditLogsPage />;
      default:
        return <DashboardPage setActiveTab={setActiveTab} setSelectedComplaintId={setSelectedComplaintId} />;
    }
  };

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderActiveView()}
    </MainLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
