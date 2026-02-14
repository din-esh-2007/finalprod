import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

const employeeNav = [
    { to: '/employee', icon: '📊', label: 'Dashboard', exact: true },
    { to: '/employee/tasks', icon: '📋', label: 'My Tasks' },
    { to: '/employee/mindfulness', icon: '🧘', label: 'Mindfulness Hub' },
    { to: '/employee/insights', icon: '🧠', label: 'Cognitive Insights' },
    { to: '/employee/reports', icon: '📜', label: 'Wellness Reports' },
    { to: '/employee/focus-prediction', icon: '🔮', label: 'Focus Forecast' },
    { to: '/employee/neuro-recovery', icon: '🔋', label: 'Neuro Recovery' },
    { to: '/employee/stability-comparison', icon: '⚖️', label: 'Peer Metrics' },
    { to: '/employee/habit-ai', icon: '✅', label: 'Habit AI' },
];

const managerNav = [
    { to: '/manager', icon: '📊', label: 'Dashboard', exact: true },
    { to: '/manager/submissions', icon: '✅', label: 'Task Reviews' },
    { to: '/manager/assign-task', icon: '📋', label: 'Assign Work' },
    { to: '/manager/stability', icon: '🛡️', label: 'Team Stability' },
    { to: '/manager/retention-risk', icon: '🚪', label: 'Retention AI' },
    { to: '/manager/future-load', icon: '📅', label: 'Load Forecast' },
    { to: '/manager/team-sentiment', icon: '🎭', label: 'Sentiment AI' },
    { to: '/manager/intensity-heatmap', icon: '🔥', label: 'Intensity Map' },
    { to: '/manager/risk-alerts', icon: '🚨', label: 'Risk Alerts' },
    { to: '/manager/balancer', icon: '⚖️', label: 'Workload Balancer' },
    { to: '/manager/team-insights', icon: '📈', label: 'Team Insights' },
];

const adminNav = [
    { to: '/admin', icon: '📊', label: 'Dashboard', exact: true },
    { to: '/admin/economic-impact', icon: '💰', label: 'Economic Impact' },
    { to: '/admin/strategic-intelligence', icon: '🧠', label: 'Strategic Intelligence' },
    { to: '/admin/create-user', icon: '➕', label: 'Create User' },
    { to: '/admin/org-intelligence', icon: '🏢', label: 'Org Intelligence' },
    { to: '/admin/policy-sim', icon: '🧪', label: 'Policy Simulator' },
    { to: '/admin/crisis-console', icon: '🆘', label: 'Crisis Console' },
    { to: '/admin/audit', icon: '🔍', label: 'Audit Center' },
    { to: '/admin/workers', icon: '👥', label: 'All Workers' },
];

export default function Layout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const role = user?.role;
    const navItems = role === 'ADMIN' ? adminNav : role === 'MANAGER' ? managerNav : employeeNav;
    const rolePrefix = role === 'ADMIN' ? '/admin' : role === 'MANAGER' ? '/manager' : '/employee';

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setShowSidebar(false);
    }, [location.pathname]);

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 5000); // 5s for real-time feel
        return () => clearInterval(interval);
    }, [rolePrefix]);

    async function loadNotifications() {
        try {
            const data = await api(`${rolePrefix}/notifications`);
            if (data && data.notifications) {
                console.log(`[Layout] Notifications loaded for ${rolePrefix}:`, data.notifications.length);
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (e) {
            console.error('[Layout] Notification load failed:', e);
        }
    }

    async function markAllRead() {
        try {
            await api(`${rolePrefix}/notifications/read`, { method: 'PUT' });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        } catch (e) { }
    }
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('mindfulness')) return 'Mindfulness Hub';
        if (path.includes('insights')) return 'Cognitive Insights';
        if (path.includes('stability')) return 'Team Stability';
        if (path.includes('risk-alerts')) return 'Risk Alerts';
        if (path.includes('balancer')) return 'Workload Balancer';
        if (path.includes('org-intelligence')) return 'Org Intelligence';
        if (path.includes('policy-sim')) return 'Policy Simulator';
        if (path.includes('crisis-console')) return 'Crisis Console';
        if (path.includes('audit')) return 'Audit Center';
        if (path.includes('tasks') || path.includes('submissions')) return 'Tasks';
        if (path.includes('report')) return 'Reports';
        if (path.includes('focus-prediction')) return 'Focus Forecast';
        if (path.includes('neuro-recovery')) return 'Neuro Recovery';
        if (path.includes('retention-risk')) return 'Retention AI';
        if (path.includes('economic-impact')) return 'Economic Impact';
        if (path.includes('team-sentiment')) return 'Sentiment AI';
        if (path.includes('habit-ai')) return 'Habit AI';
        if (path.includes('future-load')) return 'Load Forecast';
        if (path.includes('strategic-intelligence')) return 'Strategic Intelligence';
        if (path.includes('global-stability')) return 'Global Stability';
        if (path.includes('executive-summary')) return 'Executive Summary';
        return 'Dashboard';
    };

    return (
        <div className={`app-layout ${showSidebar ? 'sidebar-open' : ''}`}>
            {/* Mobile Overlay */}
            {showSidebar && (
                <div className="sidebar-overlay" onClick={() => setShowSidebar(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${showSidebar ? 'show' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">🛡️</div>
                        <div className="sidebar-logo-text">
                            <h2>Burnout &<br />Focus Guardian</h2>
                            <span>{role} Panel</span>
                        </div>
                    </div>
                    <button className="sidebar-close-mobile" onClick={() => setShowSidebar(false)}>×</button>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section-title">Navigation</div>
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.exact}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}

                    <div className="nav-section-title" style={{ marginTop: 'auto' }}>Account</div>
                    <button className="nav-item" onClick={logout}>
                        <span className="nav-icon">🚪</span>
                        <span>Logout</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="user-details">
                            <h4>{user?.name}</h4>
                            <span>{user?.position || user?.role}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="top-bar">
                    <div className="top-bar-left">
                        <button className="sidebar-toggle" onClick={() => setShowSidebar(true)}>
                            ☰
                        </button>
                        <div>
                            <h1>{getPageTitle()}</h1>
                            <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <div className="top-bar-right">
                        <button
                            className="notification-bell"
                            onClick={() => setShowNotifications(!showNotifications)}
                            id="notification-bell"
                        >
                            🔔
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="page-content" id="report-content">
                    <Outlet />
                </div>
            </main>

            {/* Notification Panel */}
            {showNotifications && (
                <>
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 199, background: 'rgba(0,0,0,0.3)' }}
                        onClick={() => setShowNotifications(false)}
                    />
                    <div className="notification-panel">
                        <div className="notification-panel-header">
                            <h3>🔔 Notifications</h3>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-xs btn-ghost" onClick={markAllRead}>Mark all read</button>
                                <button className="modal-close" onClick={() => setShowNotifications(false)}>×</button>
                            </div>
                        </div>
                        <div className="notification-list">
                            {notifications.length === 0 ? (
                                <div className="empty-state">
                                    <div className="icon">🔕</div>
                                    <h3>No notifications</h3>
                                    <p>You're all caught up!</p>
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} className={`notification-item ${n.is_read ? '' : 'unread'}`}>
                                        <p>{n.message}</p>
                                        <span>{new Date(n.created_at).toLocaleString()}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
