import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function TeamSentiment() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api('/manager/ai/team-sentiment')
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="spinner"></div>;

    return (
        <div className="team-sentiment">
            <div className="card" style={{ marginBottom: 25 }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">🎭 Team Sentiment Analysis</div>
                        <div className="card-subtitle">AI-inferred emotional resonance from communication patterns & focus volatility</div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div className="badge success">Overall: {data.overall}</div>
                        <button
                            className="btn btn-primary btn-xs"
                            onClick={() => alert('🚀 Team-Wide Neural Reset deployed! Focus-mode notifications sent to all members.')}
                        >
                            ⚡ Take Action
                        </button>
                    </div>
                </div>

                <div className="grid-2" style={{ alignItems: 'center' }}>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data.distribution} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                    {data.distribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: 15 }}>🧠 Contextual Keywords</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                            {data.keywords.map(kw => (
                                <span key={kw} className="badge neutral" style={{ padding: '8px 12px' }}>#{kw}</span>
                            ))}
                        </div>
                        <p style={{ marginTop: 20, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            The AI has detected a high frequency of "Collaborative" signals in recent task updates. However, 12% of metadata suggests "Deadline pressure" is increasing.
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                    <h4 style={{ marginBottom: 20 }}>📉 Sentiment vs. Burnout Trend (Weekly)</h4>
                    <div style={{ height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { day: 'Mon', morale: 80, fatigue: 20 },
                                { day: 'Tue', morale: 85, fatigue: 35 },
                                { day: 'Wed', morale: 70, fatigue: 55 },
                                { day: 'Thu', morale: 60, fatigue: 75 },
                                { day: 'Fri', morale: 50, fatigue: 85 },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
                                <Bar dataKey="morale" name="Team Morale" fill="var(--success)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="fatigue" name="Neural Fatigue" fill="var(--error)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 15, fontSize: 12, color: 'var(--text-muted)' }}>
                        AI Prediction: Morale tends to degrade as Neural Fatigue exceeds 60%. Next week intervention recommended for <strong>Thursday</strong>.
                    </div>
                </div>
            </div>
        </div>
    );
}
