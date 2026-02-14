import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function NeuroRecovery() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api('/employee/ai/neuro-recovery')
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="spinner"></div>;

    const mockHistory = [
        { time: '10:00', level: 80 },
        { time: '11:00', level: 65 },
        { time: '12:00', level: 40 },
        { time: '13:00', level: 85 },
        { time: '14:00', level: 70 },
        { time: '15:00', level: 95 },
    ];

    return (
        <div className="neuro-recovery">
            <div className="stats-grid">
                <div className="stat-card purple">
                    <div className="stat-value">{stats.recoveryRate}%</div>
                    <div className="stat-label">Adaptive Capacity Level</div>
                </div>
                <div className="stat-card cyan">
                    <div className="stat-value">{stats.status}</div>
                    <div className="stat-label">Resilience Status</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-value">{stats.lastReset}</div>
                    <div className="stat-label">Last Effective Recovery</div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 25 }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">🔋 Neural Recharge Cycle</div>
                        <div className="card-subtitle">Real-time simulation of your brain's recovery after downtime</div>
                    </div>
                </div>
                <div style={{ height: 300, marginTop: 20 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
                            <Area type="stepAfter" dataKey="level" stroke="var(--accent)" fill="rgba(6,182,212,0.1)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card info">
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <div style={{ fontSize: 32 }}>✨</div>
                    <div>
                        <h4 style={{ color: 'var(--accent-light)' }}>AI Recommendation: Micro-Recovery Window</h4>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 5 }}>
                            Your next peak cognitive window opens <strong>{stats.nextPeak}</strong>. A 4-minute ocular reset (looking away from screen) now will increase your peak duration by 15%.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
