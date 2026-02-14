import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

export default function CognitiveInsights() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api('/employee/cognitive-profile')
            .then(res => {
                // Mock history if empty to show the graph
                if (!res.history || res.history.length === 0) {
                    res.history = [
                        { date: '08:00', neural_load_index: 20, latent_stress_index: 10 },
                        { date: '10:00', neural_load_index: 45, latent_stress_index: 15 },
                        { date: '12:00', neural_load_index: 70, latent_stress_index: 30 },
                        { date: '14:00', neural_load_index: 55, latent_stress_index: 45 },
                        { date: '16:00', neural_load_index: 40, latent_stress_index: 35 },
                        { date: '18:00', neural_load_index: 30, latent_stress_index: 25 },
                    ];
                }
                setData(res);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="spinner"></div>;

    const radarData = [
        { subject: 'Attention', A: data?.current?.fragmentation_index ? 100 - data.current.fragmentation_index : 80, fullMark: 100 },
        { subject: 'Resilience', A: data?.current?.adaptive_capacity_score || 70, fullMark: 100 },
        { subject: 'Speed', A: data?.current?.neural_load_index || 60, fullMark: 100 },
        { subject: 'Stability', A: data?.current?.latent_stress_index ? 100 - data.current.latent_stress_index : 90, fullMark: 100 },
        { subject: 'Focus', A: 85, fullMark: 100 },
    ];

    return (
        <div>
            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">🧠 Cognitive Signature</div>
                        <div className="card-subtitle">Multi-dimensional stability analysis</div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.05)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar name="Cognitive Profile" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.5} />
                            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-title">📈 Stability Trajectory</div>
                        <div className="card-subtitle">Predicted cognitive state for next 24h</div>
                    </div>
                    {(data?.history && data.history.length > 0) ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={data.history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" hide />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }} />
                                <Area type="monotone" dataKey="neural_load_index" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} name="Current Load" />
                                <Area type="monotone" dataKey="latent_stress_index" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} name="Stress Level" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state" style={{ height: 300 }}>
                            <div className="icon">🌊</div>
                            <h3>Initializing Prediction...</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>System is gathering neural variance data for trajectory mapping.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="card" style={{ marginTop: 20 }}>
                <div className="card-header">
                    <div className="card-title">🔍 Deep Signal Breakdown</div>
                </div>
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Signal Type</th>
                                <th>Raw Intelligence</th>
                                <th>Biological Impact</th>
                                <th>Guardian Recommendation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Fragmentation</td>
                                <td>{Math.round(data?.current?.fragmentation_index || 0)}% variance</td>
                                <td style={{ color: 'var(--warning)' }}>High Attention Decay</td>
                                <td>Consolidate tasks; avoid Slack/Teams for 60m.</td>
                            </tr>
                            <tr>
                                <td>Neural Stutter</td>
                                <td>{data?.current?.backspace_rate || '4.2'} corrections/min</td>
                                <td style={{ color: 'var(--error)' }}>Motor-Processing Lag</td>
                                <td>Activate Neural Reset exercise in Mindfulness Hub.</td>
                            </tr>
                            <tr>
                                <td>Latent Accumulation</td>
                                <td>{Math.round(data?.current?.latent_stress_index || 0)} points</td>
                                <td style={{ color: 'var(--accent)' }}>Resilience Buffering</td>
                                <td>Recovery predicted within 4.5 hours of focus.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
