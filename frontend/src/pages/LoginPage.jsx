import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Shield,
  UserCheck,
  Briefcase,
  GraduationCap,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Building2,
  CheckCircle2,
  Layers
} from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regInstitution, setRegInstitution] = useState('ABC Institute of Technology');

  useEffect(() => {
    const loadDemoAccounts = async () => {
      try {
        const res = await api.getDemoAccounts();
        if (res.success && res.accounts) {
          setDemoAccounts(res.accounts);
        }
      } catch (err) {
        console.error('Failed to load demo accounts:', err);
      }
    };
    loadDemoAccounts();
  }, []);

  const handleLoginSubmit = async (e) => {
    e && e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.message);
    }
  };

  const handleQuickDemoLogin = async (acc) => {
    setEmail(acc.email);
    setPassword('demo123');
    setLoading(true);
    setError('');
    const result = await login(acc.email, 'demo123');
    setLoading(false);
    if (!result.success) {
      setError(result.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        institutionName: regInstitution
      });
      setLoading(false);
      if (res.success) {
        // Auto-login
        await login(regEmail, regPassword);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setLoading(false);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* Header Bar */}
      <header style={{ backgroundColor: '#0f2b5c', color: '#ffffff', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid #f59e0b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', color: '#0f2b5c', padding: '0.4rem 0.6rem', borderRadius: '0.375rem', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Layers size={20} color="#0f2b5c" /> SetuCase
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.02em' }}>All India Council for Technical Education</div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>AI-Powered Complaint Tracking & Bureau Coordination Platform</div>
          </div>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', color: '#fef08a' }}>
          <Shield size={14} /> Hackathon Official Demonstration Prototype
        </div>
      </header>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '1060px', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2rem', alignItems: 'stretch' }}>

          {/* Left Column: Demo Role Cards for Fast Testing */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>EVALUATOR QUICK-ACCESS</span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f2b5c', lineHeight: 1.25 }}>
                Bridging Bureaus, Connecting Cases.
              </h1>
              <p style={{ color: '#475569', fontSize: '0.925rem', marginTop: '0.5rem' }}>
                Select any verified institutional persona below to immediately launch the role-specific workspace with real seeded compliance data.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {demoAccounts.map((acc) => {
                const isStudent = acc.role === 'STUDENT';
                const isOfficer = acc.role === 'OFFICER';
                const isSupervisor = acc.role === 'SUPERVISOR';

                let icon = <GraduationCap size={22} color="#2563eb" />;
                let roleBadgeClass = 'badge-info';
                if (isOfficer) {
                  icon = <Briefcase size={22} color="#059669" />;
                  roleBadgeClass = 'badge-pending';
                } else if (isSupervisor) {
                  icon = <Shield size={22} color="#9333ea" />;
                  roleBadgeClass = 'badge-resolved';
                }

                return (
                  <div
                    key={acc.email}
                    onClick={() => handleQuickDemoLogin(acc)}
                    className="card"
                    style={{
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      borderLeft: `4px solid ${isStudent ? '#2563eb' : isOfficer ? '#059669' : '#9333ea'}`,
                      transition: 'transform 0.15s, box-shadow 0.15s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {icon}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{acc.name}</span>
                          <span className={`badge ${roleBadgeClass}`}>{acc.role}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                          {acc.designation} {acc.bureau ? `• ${acc.bureau}` : ''}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {acc.email}
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      Login <ArrowRight size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', backgroundColor: '#f1f5f9', borderRadius: '0.375rem', fontSize: '0.775rem', color: '#475569', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <AlertCircle size={16} color="#d97706" style={{ flexShrink: 0 }} />
              <div>
                <strong>Prototype Notice:</strong> Fictional institution <em>"ABC Institute of Technology"</em> is used for demonstration scenarios. All allegations are marked as reported.
              </div>
            </div>
          </div>

          {/* Right Column: Custom Login / Registration Form */}
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f2b5c' }}>
                {isRegister ? 'Register Complainant Account' : 'Portal Sign In'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                {isRegister
                  ? 'Submit institutional grievances with end-to-end status tracking'
                  : 'Enter your institutional credentials or switch tabs'}
              </p>
            </div>

            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.825rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {!isRegister ? (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      required
                      placeholder="e.g. student@demo.gov.in"
                      className="input-field"
                      style={{ paddingLeft: '2.2rem' }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="password"
                      required
                      placeholder="Enter password"
                      className="input-field"
                      style={{ paddingLeft: '2.2rem' }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>
                    Default password for demo accounts is <code>demo123</code>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.825rem', color: '#64748b' }}>
                  Are you a student complainant without an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsRegister(true); setError(''); }}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Register Here
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Rohan Patel"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Email Address</label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    placeholder="rohan@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Password</label>
                  <input
                    type="password"
                    required
                    className="input-field"
                    placeholder="Min 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Institution Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="ABC Institute of Technology"
                    value={regInstitution}
                    onChange={(e) => setRegInstitution(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.825rem', color: '#64748b' }}>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsRegister(false); setError(''); }}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '0.875rem 2rem', textAlign: 'center', fontSize: '0.775rem', color: '#64748b' }}>
        SetuCase AICTE Platform Prototype • National Grievance Redressal Architecture • Government Tech SaaS Standard
      </footer>
    </div>
  );
};
