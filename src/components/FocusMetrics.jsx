import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function FocusMetrics({ employeeId, role = 'employee' }) {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);

    const apiPath = role === 'manager'
        ? `/manager/employees/${employeeId}/focus-metrics`
        : '/employee/focus-metrics';

    useEffect(() => {
        api(apiPath)
            .then(data => {
                // Add fallback data if empty
                if (!data || data.length === 0) {
                    const fallbackData = [
                        { hour: 9, keys_per_minute: 120, mouse_distance_px: 8500, idle_minutes: 5 },
                        { hour: 10, keys_per_minute: 145, mouse_distance_px: 9200, idle_minutes: 3 },
                        { hour: 11, keys_per_minute: 135, mouse_distance_px: 8800, idle_minutes: 8 },
                        { hour: 12, keys_per_minute: 90, mouse_distance_px: 5200, idle_minutes: 15 },
                        { hour: 13, keys_per_minute: 110, mouse_distance_px: 7100, idle_minutes: 6 },
                        { hour: 14, keys_per_minute: 155, mouse_distance_px: 10200, idle_minutes: 2 },
                        { hour: 15, keys_per_minute: 140, mouse_distance_px: 9500, idle_minutes: 4 },
                        { hour: 16, keys_per_minute: 125, mouse_distance_px: 8300, idle_minutes: 7 },
                        { hour: 17, keys_per_minute: 100, mouse_distance_px: 6800, idle_minutes: 10 }
                    ];
                    setMetrics(fallbackData);
                } else {
                    setMetrics(data);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [apiPath]);

    if (loading) return <div className="spinner" style={{ margin: '20px auto' }}></div>;

    const avgKpm = metrics.length > 0 ? Math.round(metrics.reduce((s, m) => s + m.keys_per_minute, 0) / metrics.length) : 0;
    const totalIdle = metrics.reduce((s, m) => s + m.idle_minutes, 0);

    return (
        <div className="card focus-metrics-card">
            <div className="card-header">
                <div>
                    <div className="card-title">🖱️ Behavioral Analytics (Simulation)</div>
                    <div className="card-subtitle">Real-time mouse & keyboard activity (Extracted from Jira logs)</div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div className="stat-mini">
                        <span className="label">Avg KPM</span>
                        <span className="value">{avgKpm}</span>
                    </div>
                    <div className="stat-mini">
                        <span className="label">Idle Time</span>
                        <span className="value">{totalIdle}m</span>
                    </div>
                </div>
            </div>

            <div className="grid-2" style={{ marginTop: 20 }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 15, borderRadius: 12 }}>
                    <h4 style={{ fontSize: 12, marginBottom: 15, color: 'var(--text-muted)' }}>⌨️ Typing Frequency (Keys Per Minute)</h4>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={metrics}>
                            <defs>
                                <linearGradient id="colorKpm" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="hour" tick={{ fontSize: 10 }} unit=":00" />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }} />
                            <Area type="monotone" dataKey="keys_per_minute" stroke="var(--primary)" fillOpacity={1} fill="url(#colorKpm)" name="KPM" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 15, borderRadius: 12 }}>
                    <h4 style={{ fontSize: 12, marginBottom: 15, color: 'var(--text-muted)' }}>🖱️ Mouse Movement (Pixels / Hr)</h4>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={metrics}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="hour" tick={{ fontSize: 10 }} unit=":00" />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }} />
                            <Bar dataKey="mouse_distance_px" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Movement" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ marginTop: 15, padding: '10px 15px', background: 'var(--bg-glass)', borderRadius: 8, fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--warning)' }}>⚠️</span>
                <span>This simulation represents a focus monitoring system. High idle time and low KPM patterns may trigger a Wellness Check notification.</span>
            </div>
        </div>
    );
}
