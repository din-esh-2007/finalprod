import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function TeamInsights() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api('/manager/team-stability')
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="spinner"></div>;

    // Simulated trend data
    const trendData = [
        { day: 'Mon', avgLoad: 45, maxLoad: 60 },
        { day: 'Tue', avgLoad: 52, maxLoad: 75 },
        { day: 'Wed', avgLoad: 58, maxLoad: 82 },
        { day: 'Thu', avgLoad: 65, maxLoad: 88 },
        { day: 'Fri', avgLoad: 48, maxLoad: 65 },
    ];

    return (
        <div className="team-insights">
            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">📈 Weekly Neural Load Trend</div>
                        <div className="card-subtitle">Team-wide average vs individual peak spikes</div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }} />
                            <Legend />
                            <Line type="monotone" dataKey="avgLoad" stroke="var(--accent)" name="Avg Load" strokeWidth={3} />
                            <Line type="monotone" dataKey="maxLoad" stroke="var(--error)" name="Peak Spike" strokeDasharray="5 5" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-title">🛡️ Team Adaptive Strength</div>
                        <div className="card-subtitle">Recovery capacity across departments</div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={[
                            { dept: 'Tech', cap: 78 },
                            { dept: 'Design', cap: 82 },
                            { dept: 'Support', cap: 65 },
                            { dept: 'QA', cap: 91 },
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="dept" />
                            <YAxis />
                            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }} />
                            <Bar dataKey="cap" fill="#10b981" radius={[4, 4, 0, 0]} name="Capacity%" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card" style={{ marginTop: 20 }}>
                <div className="card-header">
                    <div className="card-title">💡 Managerial Optimization Advice</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginTop: 15 }}>
                    <div className="suggestion-card info">
                        <div style={{ fontWeight: 600, marginBottom: 5 }}>📅 Reduce Mid-Week Meetings</div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Wednesday shows an 18% spike in fragmentation. Consider moving standing meetings to Monday.</p>
                    </div>
                    <div className="suggestion-card success">
                        <div style={{ fontWeight: 600, marginBottom: 5 }}>🧠 High Resilience Detected</div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>QA team shows exceptional adaptive capacity. They can handle high-priority critical tasks this week.</p>
                    </div>
                    <div className="suggestion-card warning">
                        <div style={{ fontWeight: 600, marginBottom: 5 }}>⚠️ Support Team Fatigue</div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Consistent low capacity in Support suggests long-term burnout risk. Recommend rotating staff.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
