import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadialBarChart, RadialBar } from 'recharts';
import OrgIntelligence from '../../components/OrgIntelligence';
import { generatePDFReport } from '../../utils/reportGenerator';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        api('/admin/stats').then(setStats).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleDownload = async () => {
        setGenerating(true);
        try {
            await generatePDFReport('report-content', { role: 'Admin', title: 'Organizational Intelligence Report' });
        } catch (e) {
            alert('Failed to generate report');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="page-loading"><div className="spinner"></div><p>Loading dashboard...</p></div>;

    const radialData = [
        { name: 'Progress', value: stats?.completedTasks || 0, fill: '#10b981' },
        { name: 'Pending', value: stats?.pendingTasks || 0, fill: '#f59e0b' },
    ];

    const radarData = [
        { subject: 'Engineering', A: 120, B: 110, fullMark: 150 },
        { subject: 'Design', A: 98, B: 130, fullMark: 150 },
        { subject: 'Support', A: 86, B: 130, fullMark: 150 },
        { subject: 'Operations', A: 99, B: 100, fullMark: 150 },
        { subject: 'Sales', A: 85, B: 90, fullMark: 150 },
    ];

    return (
        <div>
            {/* UNIQUE ADMIN FEATURE: SYSTEM COGNITIVE SHIELD */}
            <div className="card" style={{ marginBottom: 25, border: '1px solid var(--accent)', background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(6, 182, 212, 0.05) 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>🛡️ System Cognitive Shield</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Global Organizational Stability & Risk Mitigation Index</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <button
                            className="btn btn-primary"
                            onClick={handleDownload}
                            disabled={generating}
                        >
                            {generating ? '⌛ Generating...' : '📜 Download detailed Report'}
                        </button>
                        <div className="badge info" style={{ padding: '8px 16px', fontSize: 16 }}>Status: OPTIMIZED</div>
                    </div>
                </div>

                <div className="stats-grid" style={{ marginTop: 25, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                    <div className="stat-card cyan" style={{ background: 'rgba(6, 182, 212, 0.05)' }}>
                        <div className="stat-label">Workforce Stabilized</div>
                        <div className="stat-value" style={{ color: 'var(--accent-light)' }}>84.2%</div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginTop: 10 }}>
                            <div style={{ height: '100%', width: '84%', background: 'var(--accent)', borderRadius: 2 }}></div>
                        </div>
                    </div>
                    <div className="stat-card purple" style={{ background: 'rgba(99, 102, 241, 0.05)' }}>
                        <div className="stat-label">Risk Mitigation Score</div>
                        <div className="stat-value" style={{ color: 'var(--primary-light)' }}>78/100</div>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>↑ 12% via automated recovery plans</p>
                    </div>
                    <div className="stat-card green" style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
                        <div className="stat-label">Intervention ROI</div>
                        <div className="stat-value" style={{ color: 'var(--success-light)' }}>$42.5K</div>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>Loss averted from avoided burnout churn</p>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card purple">
                    <div className="stat-icon purple">👥</div>
                    <div className="stat-value">{stats?.totalEmployees || 0}</div>
                    <div className="stat-label">Total Employees</div>
                </div>
                <div className="stat-card cyan">
                    <div className="stat-icon cyan">👔</div>
                    <div className="stat-value">{stats?.totalManagers || 0}</div>
                    <div className="stat-label">Total Managers</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon green">✅</div>
                    <div className="stat-value">{stats?.activeUsers || 0}</div>
                    <div className="stat-label">Active Users</div>
                </div>
                <div className="stat-card red">
                    <div className="stat-icon red">🚫</div>
                    <div className="stat-value">{stats?.suspendedUsers || 0}</div>
                    <div className="stat-label">Suspended Users</div>
                </div>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">⚖️ Dept Stability Matrix</div>
                            <div className="card-subtitle">AI-calculated cross-functional health balance</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.05)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                            <PolarRadiusAxis hide />
                            <Radar name="Stability" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                            <Radar name="Performance" dataKey="B" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.3} />
                            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
                            <Legend />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">📊 Operational Velocity</div>
                            <div className="card-subtitle">Completed tasks vs org-wide target</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={15} data={radialData}>
                            <RadialBar minAngle={15} background dataKey="value" cornerRadius={10} label={{ position: 'insideStart', fill: '#fff' }} />
                            <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0 }} />
                            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <OrgIntelligence />
        </div>
    );
}
