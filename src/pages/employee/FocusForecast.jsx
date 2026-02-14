import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FocusForecast() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api('/employee/ai/focus-forecast')
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="spinner"></div>;

    return (
        <div className="focus-forecast">
            <div className="card" style={{ marginBottom: 25 }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">🔮 Neural Focus Forecasting</div>
                        <div className="card-subtitle">AI-predicted focus peaks and troughs for your upcoming shift</div>
                    </div>
                    <div className="badge info">ML Model v2.4</div>
                </div>

                <div style={{ height: 350, marginTop: 20 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                            <YAxis domain={[0, 100]} hide />
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }}
                            />
                            <Area type="monotone" dataKey="focusScore" stroke="var(--primary)" fillOpacity={1} fill="url(#focusGradient)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid-2">
                <div className="card">
                    <h4 style={{ marginBottom: 15 }}>🚀 Focus Peak Detected</h4>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                        Your cognitive readiness is predicted to peak at <strong>11:00 AM</strong>. Schedule your most complex tasks during this window for 22% higher efficiency.
                    </p>
                </div>
                <div className="card">
                    <h4 style={{ marginBottom: 15 }}>⚠️ Downtime Warning</h4>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                        A biological focus trough is expected around <strong>1:30 PM</strong>. We recommend a 15-minute neural reset or administrative tasks.
                    </p>
                </div>
            </div>
        </div>
    );
}
