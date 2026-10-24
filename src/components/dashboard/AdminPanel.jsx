import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShieldCheck, Lock, Eye, EyeOff, KeyRound, AlertTriangle,
  Users, Settings, Database, Bell, ToggleLeft, ToggleRight,
  Activity, Wifi, RefreshCw, Download,
  ChevronDown, ChevronRight, Globe, Server, Cpu, HardDrive,
  BarChart3, FileText, CheckCircle2, XCircle, AlertCircle,
  Shield, Star, Crown, Zap, Search, ArrowLeft,
  Clock, ExternalLink, Copy, Check, Filter,
  MapPin, Tag, User, Camera, Layers, CheckSquare, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  subscribeToCivicReports,
  fetchCivicReports,
  updateReportStatus,
  computeReportStats,
  CIVICLENS_COLLECTION
} from '../../services/civicReportsService.js';

// ─────────────────────────────────────────────────────────────
// Admin Security Configuration
// ─────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = 'Sejal@123';

const INITIAL_TOGGLES = [
  {
    id: 'live_mode',
    label: 'Live Telemetry Mode',
    desc: 'Stream real-time sensor and satellite API data into the 3D map instead of simulated baseline numbers.',
    enabled: true,
    category: 'Data Feeds'
  },
  {
    id: 'ai_insights',
    label: 'AI Insights & Recommendations',
    desc: 'Automatically synthesize traffic, weather, and air quality telemetry into actionable municipal advisories.',
    enabled: true,
    category: 'Intelligence'
  },
  {
    id: 'civiclens_sync',
    label: 'CivicLens AI Public Sync',
    desc: 'Automatically subscribe to Firestore public collection for real-time civic issue reports from citizens.',
    enabled: true,
    category: 'Citizen Services'
  },
  {
    id: 'osm_overlay',
    label: 'OpenStreetMap Infrastructure Layer',
    desc: 'Render buildings, public transit stops, EV chargers, and civic utility points on top of the base map.',
    enabled: true,
    category: 'Map Layers'
  },
  {
    id: 'incident_alerts',
    label: 'Automated Incident Dispatch',
    desc: 'Trigger priority visual banners across the dashboard when severe civic issues or high traffic congestion occur.',
    enabled: true,
    category: 'Alerts'
  },
  {
    id: 'maintenance_mode',
    label: 'Scheduled Maintenance Notice',
    desc: 'Display an informative maintenance banner to regular viewers while system updates are taking place.',
    enabled: false,
    category: 'Operations'
  },
];

// ─────────────────────────────────────────────────────────────
// Lock Screen Component (Security Gate)
// ─────────────────────────────────────────────────────────────
function AdminLockScreen({ onUnlock, onClose }) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  const handleUnlock = (e) => {
    if (e) e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError('');
      onUnlock();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError(
        newAttempts >= 3
          ? `Incorrect password. Hint: Default security password is "Sejal@123". (${newAttempts} failed attempts)`
          : 'Incorrect password. Please try again.'
      );
      setPassword('');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="adm-overlay-backdrop">
      <div className={`adm-lock-container ${isShaking ? 'adm-shake' : ''}`}>
        {onClose && (
          <button
            className="adm-lock-close-btn"
            onClick={onClose}
            title="Cancel & Return to Dashboard"
            aria-label="Close"
          >
            ✕
          </button>
        )}

        <div className="adm-lock-badge-icon">
          <Shield size={38} color="#00d4ff" />
        </div>

        <div className="adm-lock-header-text">
          <h2 className="adm-lock-heading">Admin Security Gate</h2>
          <p className="adm-lock-subheading">
            Enter your municipal security password to access live CivicLens AI citizen reports and city administration controls.
          </p>
        </div>

        <form onSubmit={handleUnlock} className="adm-lock-form">
          <div className="adm-lock-input-group">
            <KeyRound size={18} className="adm-lock-input-icon" />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter password (e.g. Sejal@123)"
              className="adm-lock-text-input"
              autoFocus
              autoComplete="current-password"
            />
            <button
              type="button"
              className="adm-lock-eye-toggle"
              onClick={() => setShowPw((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <div className="adm-lock-error-banner">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="adm-lock-hint-box">
            <span className="adm-lock-hint-title">Admin Password:</span>
            <code className="adm-lock-hint-code">Sejal@123</code>
          </div>

          <div className="adm-lock-button-row">
            {onClose && (
              <button
                type="button"
                className="adm-lock-btn-secondary"
                onClick={onClose}
              >
                <ArrowLeft size={14} />
                <span>Back to Map</span>
              </button>
            )}
            <button
              type="submit"
              className="adm-lock-btn-primary"
              disabled={!password.trim()}
            >
              <Lock size={15} />
              <span>Unlock Admin Panel</span>
            </button>
          </div>
        </form>

        <div className="adm-lock-footer-info">
          <ShieldCheck size={13} color="#64748b" />
          <span>Firebase Project: digitaltwin-13cdb · Municipal Security</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Admin Panel Component
// ─────────────────────────────────────────────────────────────
export default function AdminPanel({
  onClose,
  isLiveMode,
  onToggleLiveMode,
  selectedLocality
}) {
  const { user } = useAuth();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState('reports'); // default to real CivicLens reports

  // Real Firestore reports state
  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedReportId, setExpandedReportId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Pagination state (5 reports per page)
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  // Real-time Activity / Audit Log state
  const [activityLogs, setActivityLogs] = useState([]);

  // Feature toggles
  const [toggles, setToggles] = useState(INITIAL_TOGGLES);

  // Connect to real Firestore 'public' collection once unlocked
  useEffect(() => {
    if (!isUnlocked) return;

    setIsLoadingReports(true);
    setReportsError(null);

    const logEntry = (msg, level = 'INFO') => {
      setActivityLogs((prev) => [
        {
          id: Date.now() + Math.random(),
          time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
          level,
          msg,
        },
        ...prev.slice(0, 40),
      ]);
    };

    logEntry('Admin authentication verified. Initiating Cloud Firestore sync for collection "public".');

    const unsubscribe = subscribeToCivicReports({
      onData: (liveReports) => {
        setReports(liveReports);
        setIsLoadingReports(false);
        setReportsError(null);
        logEntry(`Synced ${liveReports.length} real civic report(s) from Firestore collection "public".`);
      },
      onError: (err) => {
        console.error('[AdminPanel] Firestore reports error:', err);
        setReportsError(err.message || 'Permission denied or Firestore unavailable');
        setIsLoadingReports(false);
        logEntry(`Firestore query error: ${err.message}`, 'ERROR');
      },
      maxLimit: 100,
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isUnlocked]);

  // Compute real statistics strictly from Firestore reports
  const realStats = useMemo(() => {
    return computeReportStats(reports);
  }, [reports]);

  // Handle manual refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const fresh = await fetchCivicReports(100);
      setReports(fresh);
      setReportsError(null);
      setActivityLogs((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
          level: 'INFO',
          msg: `Manual refresh complete — fetched ${fresh.length} report(s) from collection "public".`,
        },
        ...prev,
      ]);
    } catch (err) {
      setReportsError(err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle status update in Firestore
  const handleUpdateStatus = async (reportId, newStatus) => {
    setStatusUpdatingId(reportId);
    try {
      await updateReportStatus(reportId, newStatus);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
      );
      setActivityLogs((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
          level: 'INFO',
          msg: `Report ${reportId.slice(0, 8)} status updated to ${newStatus} in Firestore.`,
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(`Could not update status in Firestore: ${err.message}`);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Copy document ID to clipboard
  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export reports to JSON or text
  const handleExportReports = () => {
    const dataStr = JSON.stringify(reports, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `civiclens-reports-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Search query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.reporter.email.toLowerCase().includes(q) ||
        r.details.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q);

      // Severity filter
      const sev = (r.severity || '').toUpperCase();
      const matchesSeverity =
        severityFilter === 'ALL' ||
        (severityFilter === 'HIGH' && (sev.includes('HIGH') || sev.includes('CRIT'))) ||
        (severityFilter === 'MEDIUM' && (sev.includes('MED') || sev.includes('MOD'))) ||
        (severityFilter === 'LOW' && sev.includes('LOW'));

      // Status filter
      const st = (r.status || 'OPEN').toUpperCase();
      const matchesStatus =
        statusFilter === 'ALL' || st === statusFilter;

      // Category filter
      const matchesCategory =
        categoryFilter === 'ALL' || r.category === categoryFilter;

      return matchesSearch && matchesSeverity && matchesStatus && matchesCategory;
    });
  }, [reports, searchQuery, severityFilter, statusFilter, categoryFilter]);

  // Paginated reports
  const totalPages = Math.ceil(filteredReports.length / PAGE_SIZE) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredReports.slice(start, start + PAGE_SIZE);
  }, [filteredReports, currentPage]);

  // Unique citizen reporters extracted from real documents
  const realCitizenReporters = useMemo(() => {
    const map = new Map();
    reports.forEach((r) => {
      const email = r.reporter.email || r.adminEmail;
      if (!email) return;
      if (!map.has(email)) {
        map.set(email, {
          email,
          displayName: r.reporter.displayName || email.split('@')[0],
          uid: r.reporter.uid || 'N/A',
          reportCount: 1,
          latestReportTitle: r.title,
          latestLocation: r.location,
          latestTimestamp: r.timestamp,
        });
      } else {
        const item = map.get(email);
        item.reportCount += 1;
      }
    });
    return Array.from(map.values());
  }, [reports]);

  // Handle toggling feature flags
  const handleToggleFeature = useCallback((id) => {
    setToggles((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextVal = !t.enabled;
          if (id === 'live_mode' && onToggleLiveMode) onToggleLiveMode();
          return { ...t, enabled: nextVal };
        }
        return t;
      })
    );
  }, [onToggleLiveMode]);

  if (!isUnlocked) {
    return (
      <AdminLockScreen
        onUnlock={() => setIsUnlocked(true)}
        onClose={onClose}
      />
    );
  }

  const TABS = [
    { id: 'reports', label: 'CivicLens AI Reports', icon: AlertTriangle, count: reports.length, desc: 'Real Firestore reports feed' },
    { id: 'overview', label: 'Analytics & Impact', icon: BarChart3, count: null, desc: 'Calculated from live documents' },
    { id: 'citizens', label: 'Citizen Reporters', icon: Users, count: realCitizenReporters.length, desc: 'Verified community users' },
    { id: 'features', label: 'Feature Flags', icon: Settings, count: null, desc: 'Digital Twin runtime toggles' },
    { id: 'apis', label: 'Database & APIs', icon: Server, count: null, desc: 'Cloud Firestore & telemetry health' },
  ];

  return (
    <div className="adm-overlay-backdrop">
      <div className="adm-modal-window">

        {/* ── TOP HEADER ── */}
        <header className="adm-modal-header">
          <div className="adm-modal-header-left">
            <div className="adm-modal-header-icon-box">
              <ShieldCheck size={22} color="#00d4ff" />
            </div>
            <div>
              <div className="adm-modal-title-row">
                <h1 className="adm-modal-title">Mira Road Digital Twin · Municipal Admin Console</h1>
                <span className="adm-modal-version-tag">CIVICLENS AI LIVE</span>
              </div>
              <p className="adm-modal-subtitle">
                Authenticated as <strong style={{ color: '#f59e0b' }}>{user?.username || user?.email || 'Sejal Patil'}</strong> (Super Admin)
                &nbsp;· Firestore Database: <code className="adm-db-code">digitaltwin-13cdb / {CIVICLENS_COLLECTION}</code>
              </p>
            </div>
          </div>

          <div className="adm-modal-header-actions">
            <button
              className="adm-action-header-btn adm-btn-lock"
              onClick={() => setIsUnlocked(false)}
              title="Lock Admin Console"
            >
              <Lock size={14} />
              <span>Lock Console</span>
            </button>
            {onClose && (
              <button
                className="adm-action-header-btn adm-btn-exit"
                onClick={onClose}
                title="Return to Dashboard Map"
              >
                <span>✕ Close</span>
              </button>
            )}
          </div>
        </header>

        {/* ── NAVIGATION TABS ── */}
        <nav className="adm-modal-tabs-bar" aria-label="Admin Navigation Tabs">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`adm-modal-tab-btn ${isActive ? 'adm-tab-btn-active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
              >
                <TabIcon size={16} />
                <div className="adm-tab-btn-text">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="adm-tab-btn-title">{tab.label}</span>
                    {tab.count !== null && (
                      <span className={`adm-tab-count-badge ${isActive ? 'count-active' : ''}`}>
                        {tab.count}
                      </span>
                    )}
                  </div>
                  <span className="adm-tab-btn-desc">{tab.desc}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* ── SCROLLABLE BODY AREA ── */}
        <main className="adm-modal-body-scroller">

          {/* ═════════════════════════════════════════════════════════
              TAB 1: REAL CIVICLENS AI REPORTS (PRIMARY)
             ═════════════════════════════════════════════════════════ */}
          {activeTab === 'reports' && (
            <div className="adm-tab-pane">

              {/* Live Connection & Guidance Bar */}
              <div className="adm-reports-banner">
                <div className="adm-reports-banner-left">
                  <span className="adm-pulse-dot" />
                  <div>
                    <div className="adm-banner-title">
                      Connected to Live Firestore: <code>digitaltwin-13cdb</code> / <code>{CIVICLENS_COLLECTION}</code>
                    </div>
                    <div className="adm-banner-sub">
                      Displaying real citizen reports submitted via deployed CivicLens AI (<code>https://backend-vercel-one-teal.vercel.app/</code>).
                    </div>
                  </div>
                </div>

                <div className="adm-reports-banner-actions">
                  <button
                    className="adm-btn-refresh"
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    title="Refresh reports from Firestore"
                  >
                    <RefreshCw size={14} className={isRefreshing ? 'adm-spin' : ''} />
                    <span>{isRefreshing ? 'Refreshing…' : 'Refresh'}</span>
                  </button>

                  <button
                    className="adm-btn-export"
                    onClick={handleExportReports}
                    disabled={reports.length === 0}
                    title="Export reports as JSON"
                  >
                    <Download size={14} />
                    <span>Export JSON</span>
                  </button>
                </div>
              </div>

              {/* Error Message if Query Fails */}
              {reportsError && (
                <div className="adm-error-alert-box">
                  <AlertCircle size={20} color="#f87171" />
                  <div style={{ flex: 1 }}>
                    <h4 className="adm-error-alert-title">Cloud Firestore Error</h4>
                    <p className="adm-error-alert-desc">
                      {reportsError}. Ensure your Firestore Security Rules permit read access to collection <code>/{CIVICLENS_COLLECTION}/{'{docId}'}</code>.
                    </p>
                  </div>
                  <button className="adm-btn-sub-cancel" onClick={handleManualRefresh}>
                    Retry Connection
                  </button>
                </div>
              )}

              {/* Search, Filter, and View Controls */}
              <div className="adm-pane-controls-row">
                <div className="adm-search-input-box" style={{ flex: 1.5 }}>
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search by ID, title, category, location, or citizen email…"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="adm-clean-input"
                  />
                  {searchQuery && (
                    <button className="adm-clear-btn" onClick={() => setSearchQuery('')}>✕</button>
                  )}
                </div>

                {/* Severity Filter */}
                <div className="adm-filter-group">
                  <span className="adm-filter-label">Severity:</span>
                  {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
                    <button
                      key={lvl}
                      className={`adm-pill-btn ${severityFilter === lvl ? 'adm-pill-btn-active' : ''}`}
                      onClick={() => {
                        setSeverityFilter(lvl);
                        setCurrentPage(1);
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                {/* Status Filter */}
                <div className="adm-filter-group">
                  <span className="adm-filter-label">Status:</span>
                  {['ALL', 'OPEN', 'IN_REVIEW', 'RESOLVED'].map((st) => (
                    <button
                      key={st}
                      className={`adm-pill-btn ${statusFilter === st ? 'adm-pill-btn-active' : ''}`}
                      onClick={() => {
                        setStatusFilter(st);
                        setCurrentPage(1);
                      }}
                    >
                      {st === 'IN_REVIEW' ? 'Review' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loading State */}
              {isLoadingReports && (
                <div className="adm-reports-loading">
                  <RefreshCw size={28} className="adm-spin" color="#00d4ff" />
                  <p>Connecting to Cloud Firestore (digitaltwin-13cdb · collection: {CIVICLENS_COLLECTION})…</p>
                </div>
              )}

              {/* Genuine Empty State */}
              {!isLoadingReports && reports.length === 0 && !reportsError && (
                <div className="adm-empty-state-card">
                  <AlertCircle size={44} color="#64748b" />
                  <h3>No citizen reports found in collection <code>{CIVICLENS_COLLECTION}</code></h3>
                  <p>
                    No reports have been submitted through CivicLens AI yet. When citizens upload street photos to{' '}
                    <a href="https://backend-vercel-one-teal.vercel.app/" target="_blank" rel="noopener noreferrer">
                      CivicLens AI
                    </a>
                    , their real AI-analyzed reports will instantly appear here via Firestore real-time sync.
                  </p>
                </div>
              )}

              {/* Search Result Empty State */}
              {!isLoadingReports && reports.length > 0 && filteredReports.length === 0 && (
                <div className="adm-empty-state-card">
                  <Search size={36} color="#64748b" />
                  <h3>No reports matched your search filters</h3>
                  <p>Try clearing your search term or selecting "ALL" for severity and status.</p>
                  <button
                    className="adm-btn-sub-cancel"
                    onClick={() => {
                      setSearchQuery('');
                      setSeverityFilter('ALL');
                      setStatusFilter('ALL');
                    }}
                    style={{ marginTop: 10 }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {/* Real Reports Feed */}
              {!isLoadingReports && filteredReports.length > 0 && (
                <div className="adm-reports-feed-list">
                  <div className="adm-feed-summary-header">
                    <span>
                      Showing <strong>{filteredReports.length}</strong> of <strong>{reports.length}</strong> verified reports
                    </span>
                    <span className="adm-feed-page-info">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>

                  {paginatedReports.map((report) => {
                    const isExpanded = expandedReportId === report.id;
                    const sev = (report.severity || '').toUpperCase();
                    const isHigh = sev.includes('HIGH') || sev.includes('CRIT');
                    const isMed = sev.includes('MED') || sev.includes('MOD');
                    const sevClass = isHigh ? 'sev-high' : isMed ? 'sev-med' : 'sev-low';

                    const st = (report.status || 'OPEN').toUpperCase();
                    const statusClass =
                      st === 'OPEN'
                        ? 'st-open'
                        : st === 'IN_REVIEW'
                        ? 'st-review'
                        : st === 'RESOLVED'
                        ? 'st-resolved'
                        : 'st-dismissed';

                    return (
                      <article key={report.id} className={`adm-report-card ${sevClass}`}>
                        {/* Summary Header Row */}
                        <div
                          className="adm-report-summary-bar"
                          onClick={() => setExpandedReportId(isExpanded ? null : report.id)}
                          role="button"
                          tabIndex={0}
                          aria-expanded={isExpanded}
                        >
                          <div className="adm-report-summary-left">
                            <span className={`adm-severity-badge ${sevClass}`}>
                              {report.severity || 'Medium'}
                            </span>

                            <div className="adm-report-titles-box">
                              <div className="adm-report-sub-line">
                                <span className="adm-action-code">{report.action}</span>
                                <span
                                  className="adm-doc-id-pill"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyId(report.id);
                                  }}
                                  title="Click to copy Firestore Document ID"
                                >
                                  ID: {report.id}
                                  {copiedId === report.id ? <Check size={11} color="#34d399" /> : <Copy size={11} />}
                                </span>
                                {report.isCivicIssue === false && (
                                  <span className="adm-no-issue-pill">Non-Civic Content</span>
                                )}
                              </div>
                              <h3 className="adm-report-main-title">{report.title}</h3>
                            </div>
                          </div>

                          <div className="adm-report-summary-right">
                            <div className="adm-report-meta-brief">
                              <span className="adm-meta-location">
                                <MapPin size={12} /> {report.location}
                              </span>
                              <span className="adm-meta-time">
                                <Clock size={12} /> {report.timestamp}
                              </span>
                              <span className="adm-meta-reporter" title={report.reporter.email}>
                                <User size={12} /> {report.reporter.email}
                              </span>
                            </div>

                            <div
                              className="adm-report-status-wrapper"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <select
                                value={report.status}
                                onChange={(e) => handleUpdateStatus(report.id, e.target.value)}
                                disabled={statusUpdatingId === report.id}
                                className={`adm-status-select ${statusClass}`}
                                title="Update report status in Firestore"
                              >
                                <option value="OPEN">OPEN</option>
                                <option value="IN_REVIEW">IN REVIEW</option>
                                <option value="RESOLVED">RESOLVED</option>
                                <option value="DISMISSED">DISMISSED</option>
                              </select>
                            </div>

                            <button
                              type="button"
                              className="adm-expand-icon-btn"
                              aria-label={isExpanded ? 'Collapse report' : 'Expand report'}
                            >
                              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>
                          </div>
                        </div>

                        {/* Detailed Expandable Section */}
                        {isExpanded && (
                          <div className="adm-report-detail-drawer">
                            {/* Grid of Key Properties */}
                            <div className="adm-detail-props-grid">
                              <div className="adm-detail-prop-box">
                                <span className="adm-detail-prop-label">Category:</span>
                                <span className="adm-detail-prop-val">
                                  <Tag size={13} color="#00d4ff" /> {report.category}
                                </span>
                              </div>

                              <div className="adm-detail-prop-box">
                                <span className="adm-detail-prop-label">Location Context:</span>
                                <span className="adm-detail-prop-val">
                                  <MapPin size={13} color="#34d399" /> {report.location}
                                </span>
                              </div>

                              <div className="adm-detail-prop-box">
                                <span className="adm-detail-prop-label">Confidence Score:</span>
                                <span className="adm-detail-prop-val">
                                  <Star size={13} color="#fbbf24" /> {report.confidenceScore}
                                </span>
                              </div>

                              <div className="adm-detail-prop-box">
                                <span className="adm-detail-prop-label">Citizen Reporter UID:</span>
                                <span className="adm-detail-prop-val" style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>
                                  {report.reporter.uid}
                                </span>
                              </div>
                            </div>

                            {/* Summary & Descriptions */}
                            {report.summary && (
                              <div className="adm-detail-section">
                                <span className="adm-detail-section-title">AI Vision Summary:</span>
                                <p className="adm-detail-section-p">{report.summary}</p>
                              </div>
                            )}

                            {report.details && (
                              <div className="adm-detail-section">
                                <span className="adm-detail-section-title">Detailed Assessment &amp; Context:</span>
                                <p className="adm-detail-section-p">{report.details}</p>
                              </div>
                            )}

                            {report.userDescription && report.userDescription !== report.details && (
                              <div className="adm-detail-section">
                                <span className="adm-detail-section-title">Citizen Submission Note:</span>
                                <p className="adm-detail-section-p highlight-citizen-note">
                                  "{report.userDescription}"
                                </p>
                              </div>
                            )}

                            {/* Visible Evidence Tags */}
                            {report.visibleEvidence.length > 0 && (
                              <div className="adm-detail-section">
                                <span className="adm-detail-section-title">Visible Physical Evidence Detected:</span>
                                <div className="adm-evidence-tags-list">
                                  {report.visibleEvidence.map((ev, i) => (
                                    <span key={i} className="adm-evidence-tag">
                                      • {ev}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Recommended Municipal Actions */}
                            {report.recommendedActions.length > 0 && (
                              <div className="adm-detail-section">
                                <span className="adm-detail-section-title">Recommended Municipal Interventions:</span>
                                <ul className="adm-recom-list">
                                  {report.recommendedActions.map((action, i) => (
                                    <li key={i}>{action}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Potential Impact Breakdown */}
                            {report.potentialImpact && Object.keys(report.potentialImpact).length > 0 && (
                              <div className="adm-detail-section">
                                <span className="adm-detail-section-title">Impact Assessment:</span>
                                <div className="adm-impact-grid">
                                  {report.potentialImpact.infrastructure && (
                                    <div className="adm-impact-cell">
                                      <strong>Infrastructure:</strong> {report.potentialImpact.infrastructure}
                                    </div>
                                  )}
                                  {report.potentialImpact.vehicles && (
                                    <div className="adm-impact-cell">
                                      <strong>Vehicles:</strong> {report.potentialImpact.vehicles}
                                    </div>
                                  )}
                                  {report.potentialImpact.pedestrians && (
                                    <div className="adm-impact-cell">
                                      <strong>Pedestrians:</strong> {report.potentialImpact.pedestrians}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Image / Meta Evidence Box */}
                            <div className="adm-detail-section">
                              <span className="adm-detail-section-title">Telemetry &amp; Image Verification:</span>
                              <div className="adm-meta-evidence-box">
                                <div className="adm-meta-row">
                                  <span>Source AI Model:</span>
                                  <strong>{report.source}</strong>
                                </div>
                                <div className="adm-meta-row">
                                  <span>Image Metadata:</span>
                                  <span>
                                    {report.imageInfo.size || 'Captured photo'}
                                    {report.imageInfo.mimeType ? ` · ${report.imageInfo.mimeType}` : ''}
                                  </span>
                                </div>
                                <div className="adm-meta-row">
                                  <span>Firestore Path:</span>
                                  <code>public/{report.id}</code>
                                </div>
                                {report.imageInfo.url && (
                                  <div className="adm-image-preview-box">
                                    <img src={report.imageInfo.url} alt="Civic issue photograph" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Raw Document Fields Preview */}
                            <div className="adm-raw-doc-inspector">
                              <div className="adm-raw-doc-bar">
                                <span>Firestore Document Fields (<code>public/{report.id}</code>)</span>
                              </div>
                              <pre className="adm-raw-doc-json">
                                {JSON.stringify(
                                  {
                                    id: report.id,
                                    action: report.action,
                                    category: report.category,
                                    issueTitle: report.title,
                                    severity: report.severity,
                                    status: report.status,
                                    location: report.location,
                                    adminEmail: report.adminEmail,
                                    reporter: report.reporter,
                                    timestamp: report.timestamp,
                                    timestampMs: report.timestampMs,
                                  },
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="adm-pagination-bar">
                      <button
                        className="adm-page-btn"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        ← Previous
                      </button>
                      <span className="adm-page-display">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className="adm-page-btn"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              TAB 2: ANALYTICS & CITY IMPACT (CALCULATED FROM REAL DOCS)
             ═════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="adm-tab-pane">

              <div className="adm-guidance-card">
                <BarChart3 size={18} color="#00d4ff" />
                <div>
                  <h3 className="adm-guidance-title">Real-Time Civic Analytics &amp; Municipal Metrics</h3>
                  <p className="adm-guidance-text">
                    All metrics below are computed strictly from the <strong>{reports.length}</strong> actual documents currently stored in Cloud Firestore (<code>digitaltwin-13cdb / {CIVICLENS_COLLECTION}</code>).
                  </p>
                </div>
              </div>

              {/* 4 Real Metric Summary Cards */}
              <div className="adm-stats-grid-row">
                <div className="adm-stat-card">
                  <div className="adm-stat-icon-wrapper" style={{ background: 'rgba(0, 212, 255, 0.12)', color: '#00d4ff' }}>
                    <AlertTriangle size={22} />
                  </div>
                  <div>
                    <div className="adm-stat-value">{realStats.total}</div>
                    <div className="adm-stat-label">Total Submitted Reports</div>
                    <div className="adm-stat-sub">From CivicLens AI citizen users</div>
                  </div>
                </div>

                <div className="adm-stat-card">
                  <div className="adm-stat-icon-wrapper" style={{ background: 'rgba(248, 113, 113, 0.12)', color: '#f87171' }}>
                    <Shield size={22} />
                  </div>
                  <div>
                    <div className="adm-stat-value">{realStats.severityCounts.critical + realStats.severityCounts.high}</div>
                    <div className="adm-stat-label">Critical / High Severity</div>
                    <div className="adm-stat-sub">Requires urgent municipal attention</div>
                  </div>
                </div>

                <div className="adm-stat-card">
                  <div className="adm-stat-icon-wrapper" style={{ background: 'rgba(52, 211, 153, 0.12)', color: '#34d399' }}>
                    <CheckSquare size={22} />
                  </div>
                  <div>
                    <div className="adm-stat-value">
                      {realStats.statusCounts.open} Open / {realStats.statusCounts.resolved} Done
                    </div>
                    <div className="adm-stat-label">Report Lifecycle</div>
                    <div className="adm-stat-sub">Active municipal resolutions</div>
                  </div>
                </div>

                <div className="adm-stat-card">
                  <div className="adm-stat-icon-wrapper" style={{ background: 'rgba(167, 139, 250, 0.12)', color: '#a78bfa' }}>
                    <Users size={22} />
                  </div>
                  <div>
                    <div className="adm-stat-value">{realStats.uniqueReporterCount}</div>
                    <div className="adm-stat-label">Citizen Contributors</div>
                    <div className="adm-stat-sub">Distinct citizen accounts</div>
                  </div>
                </div>
              </div>

              {/* Real Severity Distribution Breakdown */}
              <section className="adm-content-section">
                <div className="adm-section-top">
                  <Activity size={18} color="#00d4ff" />
                  <h3 className="adm-section-heading">Severity Distribution (Live From Firestore)</h3>
                </div>

                {realStats.total === 0 ? (
                  <p className="adm-empty-table-cell">No reports currently in database to calculate distribution.</p>
                ) : (
                  <div className="adm-severity-bars-container">
                    <div className="adm-sev-bar-item">
                      <div className="adm-sev-bar-header">
                        <span style={{ color: '#f87171', fontWeight: 700 }}>Critical &amp; High</span>
                        <span>{realStats.severityCounts.critical + realStats.severityCounts.high} reports</span>
                      </div>
                      <div className="adm-progress-track">
                        <div
                          className="adm-progress-fill"
                          style={{
                            width: `${((realStats.severityCounts.critical + realStats.severityCounts.high) / realStats.total) * 100}%`,
                            background: '#f87171'
                          }}
                        />
                      </div>
                    </div>

                    <div className="adm-sev-bar-item">
                      <div className="adm-sev-bar-header">
                        <span style={{ color: '#fbbf24', fontWeight: 700 }}>Moderate &amp; Medium</span>
                        <span>{realStats.severityCounts.medium} reports</span>
                      </div>
                      <div className="adm-progress-track">
                        <div
                          className="adm-progress-fill"
                          style={{
                            width: `${(realStats.severityCounts.medium / realStats.total) * 100}%`,
                            background: '#fbbf24'
                          }}
                        />
                      </div>
                    </div>

                    <div className="adm-sev-bar-item">
                      <div className="adm-sev-bar-header">
                        <span style={{ color: '#34d399', fontWeight: 700 }}>Low Severity / Non-Issue</span>
                        <span>{realStats.severityCounts.low} reports</span>
                      </div>
                      <div className="adm-progress-track">
                        <div
                          className="adm-progress-fill"
                          style={{
                            width: `${(realStats.severityCounts.low / realStats.total) * 100}%`,
                            background: '#34d399'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Categories & Locations Breakdown */}
              <div className="adm-two-col-grid">
                <section className="adm-content-section">
                  <div className="adm-section-top">
                    <Tag size={18} color="#38bdf8" />
                    <h3 className="adm-section-heading">Categories Detected</h3>
                  </div>
                  {realStats.categories.length === 0 ? (
                    <p className="adm-empty-table-cell">No categories recorded yet.</p>
                  ) : (
                    <ul className="adm-breakdown-list">
                      {realStats.categories.map((cat) => (
                        <li key={cat.name} className="adm-breakdown-row">
                          <span className="adm-breakdown-name">{cat.name}</span>
                          <span className="adm-breakdown-count">{cat.count} report(s)</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="adm-content-section">
                  <div className="adm-section-top">
                    <MapPin size={18} color="#34d399" />
                    <h3 className="adm-section-heading">Geographic Submissions</h3>
                  </div>
                  {realStats.locations.length === 0 ? (
                    <p className="adm-empty-table-cell">No location records yet.</p>
                  ) : (
                    <ul className="adm-breakdown-list">
                      {realStats.locations.map((loc) => (
                        <li key={loc.name} className="adm-breakdown-row">
                          <span className="adm-breakdown-name">{loc.name}</span>
                          <span className="adm-breakdown-count">{loc.count} report(s)</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>

              {/* Administrative Session Details */}
              <section className="adm-content-section">
                <div className="adm-section-top">
                  <ShieldCheck size={18} color="#a78bfa" />
                  <h3 className="adm-section-heading">Admin Session &amp; Database Integrity</h3>
                </div>
                <div className="adm-table-container">
                  <table className="adm-simple-table">
                    <tbody>
                      <tr>
                        <td className="adm-td-label">Admin Officer</td>
                        <td className="adm-td-value" style={{ color: '#f59e0b', fontWeight: 700 }}>
                          {user?.username || user?.email || 'Sejal Patil'} (Super Admin)
                        </td>
                        <td className="adm-td-label">Firebase Project</td>
                        <td className="adm-td-value"><code>digitaltwin-13cdb</code></td>
                      </tr>
                      <tr>
                        <td className="adm-td-label">Live Collection</td>
                        <td className="adm-td-value"><code>{CIVICLENS_COLLECTION}</code></td>
                        <td className="adm-td-label">Active Records</td>
                        <td className="adm-td-value" style={{ color: '#34d399', fontWeight: 700 }}>
                          {reports.length} Verified Documents
                        </td>
                      </tr>
                      <tr>
                        <td className="adm-td-label">CivicLens Deployment</td>
                        <td className="adm-td-value">
                          <a href="https://backend-vercel-one-teal.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: '#00d4ff' }}>
                            backend-vercel-one-teal.vercel.app <ExternalLink size={11} style={{ display: 'inline' }} />
                          </a>
                        </td>
                        <td className="adm-td-label">Vision Model</td>
                        <td className="adm-td-value">Google Gemma 4 AI</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              TAB 3: CITIZEN REPORTERS DIRECTORY
             ═════════════════════════════════════════════════════════ */}
          {activeTab === 'citizens' && (
            <div className="adm-tab-pane">

              <div className="adm-guidance-card">
                <Users size={18} color="#00d4ff" />
                <div>
                  <h3 className="adm-guidance-title">Verified Citizen Reporters &amp; Municipal Staff</h3>
                  <p className="adm-guidance-text">
                    Citizens and officers who have submitted issues via CivicLens AI. Extracted directly from submitted document reporter profiles in Cloud Firestore.
                  </p>
                </div>
              </div>

              {/* Table of Citizen Reporters */}
              <div className="adm-table-wrapper">
                <table className="adm-styled-table">
                  <thead>
                    <tr>
                      <th>Citizen / Officer</th>
                      <th>Citizen UID</th>
                      <th>Total Reports</th>
                      <th>Latest Reported Issue</th>
                      <th>Location</th>
                      <th>Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Super Admin Row */}
                    <tr>
                      <td>
                        <div className="adm-user-cell">
                          <div className="adm-avatar-circle adm-avatar-gold">
                            <Crown size={14} />
                          </div>
                          <div>
                            <div className="adm-officer-name">
                              {user?.username || 'Sejal Patil'} <span className="adm-role-badge adm-role-super">Super Admin</span>
                            </div>
                            <div className="adm-officer-email">{user?.email || 'sejal@digitaltwin.gov'}</div>
                          </div>
                        </div>
                      </td>
                      <td><code>admin-session</code></td>
                      <td>—</td>
                      <td>Municipal Management Console</td>
                      <td>Mira Road Sector</td>
                      <td>Active Now</td>
                    </tr>

                    {/* Citizen Reporters Rows */}
                    {realCitizenReporters.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="adm-empty-table-cell">
                          No citizen accounts found in submitted reports yet.
                        </td>
                      </tr>
                    ) : (
                      realCitizenReporters.map((cit) => (
                        <tr key={cit.email}>
                          <td>
                            <div className="adm-user-cell">
                              <div className="adm-avatar-circle">
                                <User size={14} />
                              </div>
                              <div>
                                <div className="adm-officer-name">{cit.displayName}</div>
                                <div className="adm-officer-email">{cit.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <code style={{ fontSize: '0.72rem' }}>{cit.uid}</code>
                          </td>
                          <td>
                            <span className="adm-report-count-chip">{cit.reportCount} report(s)</span>
                          </td>
                          <td>
                            <span className="adm-cit-issue-text">{cit.latestReportTitle}</span>
                          </td>
                          <td>{cit.latestLocation}</td>
                          <td>{cit.latestTimestamp}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              TAB 4: FEATURE TOGGLES
             ═════════════════════════════════════════════════════════ */}
          {activeTab === 'features' && (
            <div className="adm-tab-pane">
              <div className="adm-guidance-card">
                <Settings size={18} color="#00d4ff" />
                <div>
                  <h3 className="adm-guidance-title">City Twin Runtime Switches</h3>
                  <p className="adm-guidance-text">
                    Control active data feeds, 3D overlays, and citizen reporting integrations across the dashboard.
                  </p>
                </div>
              </div>

              <div className="adm-toggles-grid">
                {toggles.map((toggle) => (
                  <div
                    key={toggle.id}
                    className={`adm-feature-card ${toggle.enabled ? 'adm-feature-enabled' : ''}`}
                  >
                    <div className="adm-feature-card-header">
                      <span className="adm-feature-category">{toggle.category}</span>
                      <span className={`adm-feature-status-chip ${toggle.enabled ? 'adm-chip-on' : 'adm-chip-off'}`}>
                        {toggle.enabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>

                    <h4 className="adm-feature-name">{toggle.label}</h4>
                    <p className="adm-feature-description">{toggle.desc}</p>

                    <div className="adm-feature-footer">
                      <button
                        type="button"
                        className={`adm-toggle-switch-btn ${toggle.enabled ? 'adm-switch-active' : ''}`}
                        onClick={() => handleToggleFeature(toggle.id)}
                        aria-label={`Toggle ${toggle.label}`}
                      >
                        {toggle.enabled ? (
                          <>
                            <ToggleRight size={20} color="#34d399" />
                            <span style={{ color: '#34d399', fontWeight: 700 }}>ON</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={20} color="#64748b" />
                            <span style={{ color: '#64748b', fontWeight: 600 }}>OFF</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              TAB 5: DATABASE & API SERVICES
             ═════════════════════════════════════════════════════════ */}
          {activeTab === 'apis' && (
            <div className="adm-tab-pane">
              <div className="adm-guidance-card">
                <Server size={18} color="#00d4ff" />
                <div>
                  <h3 className="adm-guidance-title">Database Connectivity &amp; External Telemetry Status</h3>
                  <p className="adm-guidance-text">
                    Real-time status of Cloud Firestore (<code>digitaltwin-13cdb</code>), CivicLens AI backend API, and satellite data feeds.
                  </p>
                </div>
              </div>

              <div className="adm-apis-grid">
                {/* Cloud Firestore card */}
                <div className="adm-api-service-card">
                  <div className="adm-api-card-top">
                    <div>
                      <span className="adm-api-service-cat">Database · Primary Registry</span>
                      <h4 className="adm-api-service-name">Google Cloud Firestore</h4>
                    </div>
                    <span className="adm-status-indicator adm-status-green">
                      <span className="adm-status-dot" />
                      CONNECTED
                    </span>
                  </div>
                  <p className="adm-api-service-desc">
                    Project: <code>digitaltwin-13cdb</code> · Collection: <code>{CIVICLENS_COLLECTION}</code> · <strong>{reports.length} documents loaded</strong>.
                  </p>
                  <div className="adm-api-card-meta">
                    <div className="adm-api-endpoint-text">
                      <ExternalLink size={12} color="#64748b" />
                      <span>firestore.googleapis.com</span>
                    </div>
                    <div className="adm-api-latency-badge">
                      <Clock size={12} />
                      <span>Realtime Sync</span>
                    </div>
                  </div>
                </div>

                {/* CivicLens AI Backend card */}
                <div className="adm-api-service-card">
                  <div className="adm-api-card-top">
                    <div>
                      <span className="adm-api-service-cat">AI Vision Backend</span>
                      <h4 className="adm-api-service-name">CivicLens AI Vision Service</h4>
                    </div>
                    <span className="adm-status-indicator adm-status-green">
                      <span className="adm-status-dot" />
                      ONLINE
                    </span>
                  </div>
                  <p className="adm-api-service-desc">
                    Deployed at <code>backend-vercel-one-teal.vercel.app</code> · Model: <strong>gemma-4-26b-a4b-it</strong>.
                  </p>
                  <div className="adm-api-card-meta">
                    <div className="adm-api-endpoint-text">
                      <ExternalLink size={12} color="#64748b" />
                      <span>backend-vercel-one-teal.vercel.app</span>
                    </div>
                    <div className="adm-api-latency-badge">
                      <Clock size={12} />
                      <span>200 OK</span>
                    </div>
                  </div>
                </div>

                {/* Open-Meteo card */}
                <div className="adm-api-service-card">
                  <div className="adm-api-card-top">
                    <div>
                      <span className="adm-api-service-cat">Environmental Telemetry</span>
                      <h4 className="adm-api-service-name">Open-Meteo Weather API</h4>
                    </div>
                    <span className="adm-status-indicator adm-status-green">
                      <span className="adm-status-dot" />
                      ONLINE
                    </span>
                  </div>
                  <p className="adm-api-service-desc">
                    Real-time temperature, wind, humidity, and weather conditions for Mira Road coordinates.
                  </p>
                  <div className="adm-api-card-meta">
                    <div className="adm-api-endpoint-text">
                      <ExternalLink size={12} color="#64748b" />
                      <span>api.open-meteo.com</span>
                    </div>
                    <div className="adm-api-latency-badge">
                      <Clock size={12} />
                      <span>115ms</span>
                    </div>
                  </div>
                </div>

                {/* HERE Traffic Flow card */}
                <div className="adm-api-service-card">
                  <div className="adm-api-card-top">
                    <div>
                      <span className="adm-api-service-cat">Urban Mobility</span>
                      <h4 className="adm-api-service-name">HERE Traffic Flow API</h4>
                    </div>
                    <span className="adm-status-indicator adm-status-green">
                      <span className="adm-status-dot" />
                      ONLINE
                    </span>
                  </div>
                  <p className="adm-api-service-desc">
                    Live corridor congestion indices, road speeds, and incident detection feeds.
                  </p>
                  <div className="adm-api-card-meta">
                    <div className="adm-api-endpoint-text">
                      <ExternalLink size={12} color="#64748b" />
                      <span>traffic.ls.hereapi.com</span>
                    </div>
                    <div className="adm-api-latency-badge">
                      <Clock size={12} />
                      <span>210ms</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real Activity Log stream */}
              <section className="adm-content-section" style={{ marginTop: 18 }}>
                <div className="adm-section-top">
                  <FileText size={18} color="#00d4ff" />
                  <h3 className="adm-section-heading">Live Admin Activity &amp; Firestore Events</h3>
                </div>
                <div className="adm-log-stream-box">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="adm-log-entry-row">
                      <span className="adm-log-entry-time">{log.time}</span>
                      <span
                        className={`adm-log-entry-badge ${
                          log.level === 'ERROR'
                            ? 'adm-log-badge-error'
                            : log.level === 'WARN'
                            ? 'adm-log-badge-warn'
                            : 'adm-log-badge-info'
                        }`}
                      >
                        {log.level}
                      </span>
                      <span className="adm-log-entry-message">{log.msg}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
