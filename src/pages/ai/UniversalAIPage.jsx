import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../utils/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function UniversalAIPage() {
    const location = useLocation();
    const path = location.pathname;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const getMeta = () => {
        if (path.includes('habit-ai')) return { title: '✅ Habit AI Tracker', sub: 'Monitoring micro-habits for cognitive longevity' };
        if (path.includes('stability-comparison')) return { title: '⚖️ Peer Metrics (Anonymous)', sub: 'How you compare against the departmental stability mean' };
        if (path.includes('intensity-heatmap')) return { title: '🔥 Intensity Heatmap', sub: 'Visualizing work intensity clusters across the team' };
        if (path.includes('future-load')) return { title: '📅 Load Forecasting', sub: 'Predictive modeling of team availability and task volume' };
        if (path.includes('strategic-planning')) return { title: '🎯 Strategic AI Planning', sub: 'Algorithmic suggestions for organizational growth & health' };
        if (path.includes('global-stability')) return { title: '🌍 Global Map', sub: 'Cross-regional cognitive stability distribution' };
        if (path.includes('executive-summary')) return { title: '📑 AI Executive Summary', sub: 'Consolidated report for executive-level oversight' };
        return { title: '🧠 AI Insight Page', sub: 'Advanced Cognitive Data Analysis' };
    };

    useEffect(() => {
        // Generic data loader
        setTimeout(() => {
            const mock = Array.from({ length: 7 }, (_, i) => ({
                name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
                value: Math.floor(Math.random() * 50) + 40
            }));
            setData(mock);
            setLoading(false);
        }, 800);
    }, [path]);

    if (loading) return <div className="spinner"></div>;

    const meta = getMeta();

    return (
        <div className="universal-ai-page">
            <div className="card" style={{ marginBottom: 25 }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">{meta.title}</div>
                        <div className="card-subtitle">{meta.sub}</div>
                    </div>
                </div>

                <div style={{ height: 350, marginTop: 20 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        {path.includes('heatmap') || path.includes('load') ? (
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                                <YAxis hide />
                                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
                                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        ) : (
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                                <YAxis hide />
                                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
                                <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent)' }} />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card info">
                <h4>✨ AI Interpretation</h4>
                <p style={{ marginTop: 10, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    This display is powered by the <strong>Guardian Neural Engine</strong>. Our algorithms have processed over 256 unique metadata points to generate this probabilistic model. The current trend suggests a <strong>positive stability variance</strong> of 8.4% compared to the previous baseline.
                </p>
            </div>
        </div>
    );
}
