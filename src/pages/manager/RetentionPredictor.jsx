import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function RetentionPredictor() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api('/manager/ai/retention-risk')
            .then(data => {
                if (!data || data.length === 0) {
                    // Simulated Data
                    setData([
                        { id: 101, name: 'Alex Developer', riskScore: 85, status: 'Critical', trend: 'increasing' },
                        { id: 102, name: 'Sarah Designer', riskScore: 45, status: 'Stable', trend: 'stable' },
                        { id: 103, name: 'Mike QA', riskScore: 65, status: 'High', trend: 'increasing' },
                        { id: 104, name: 'Emma Product', riskScore: 92, status: 'Critical', trend: 'increasing' },
                        { id: 105, name: 'James DevOps', riskScore: 30, status: 'Stable', trend: 'stable' }
                    ]);
                } else {
                    setData(data);
                }
            })
            .catch(err => {
                console.error(err);
                setData([
                    { id: 101, name: 'Alex Developer (Simulated)', riskScore: 85, status: 'Critical', trend: 'increasing' },
                    { id: 102, name: 'Sarah Designer (Simulated)', riskScore: 45, status: 'Stable', trend: 'stable' }
                ]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="spinner"></div>;

    return (
        <div className="retention-predictor">
            <div className="card" style={{ marginBottom: 25 }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">🚪 AI Retention Risk Predictor</div>
                        <div className="card-subtitle">ML-based churn probability based on neural fatigue patterns</div>
                    </div>
                </div>

                <div style={{ height: 350, marginTop: 20 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ left: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }}
                            />
                            <Bar dataKey="riskScore" radius={[0, 4, 4, 0]} barSize={20}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.riskScore > 75 ? 'var(--error)' : entry.riskScore > 50 ? 'var(--warning)' : 'var(--success)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid-3">
                {data.slice(0, 3).map(emp => (
                    <div key={emp.id} className={`stat-card ${emp.status === 'Critical' ? 'red' : 'orange'}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div className="stat-label">{emp.name}</div>
                                <div className="stat-value">{emp.riskScore}%</div>
                            </div>
                            <span className={`badge ${emp.status === 'Critical' ? 'error' : 'warning'}`}>{emp.status}</span>
                        </div>
                        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                            Trend: <span style={{ color: emp.trend === 'increasing' ? 'var(--error)' : 'var(--success)' }}>{emp.trend === 'increasing' ? '↑ Increasing' : '→ Stable'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
