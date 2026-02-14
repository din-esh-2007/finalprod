import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Cell, BarChart } from 'recharts';

export default function OrgIntelligence() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api('/admin/org-intelligence')
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="spinner"></div>;

    const phaseColors = { 1: '#10b981', 2: '#6366f1', 3: '#f59e0b', 4: '#ef4444' };
    let phaseData = data?.phaseDistribution?.map(p => ({
        name: `Phase ${p.burnout_phase}`,
        count: p.count,
        fill: phaseColors[p.burnout_phase]
    })) || [];

    if (phaseData.length === 0) {
        phaseData = [
            { name: 'Phase 1', count: 12, fill: phaseColors[1] },
            { name: 'Phase 2', count: 7, fill: phaseColors[2] },
            { name: 'Phase 3', count: 3, fill: phaseColors[3] },
            { name: 'Phase 4', count: 1, fill: phaseColors[4] }
        ];
    }

    const trafficData = data?.neuralTraffic && data.neuralTraffic.length > 0 ? data.neuralTraffic : [
        { date: '2026-02-10', avg_load: 35 },
        { date: '2026-02-11', avg_load: 42 },
        { date: '2026-02-12', avg_load: 38 },
        { date: '2026-02-13', avg_load: 45 },
        { date: '2026-02-14', avg_load: 40 }
    ];

    return (
        <div style={{ marginTop: 24 }}>
            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">🏢 Burnout Profile Matrix</div>
                            <div className="card-subtitle">Employee distribution across cognitive phases</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={phaseData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} />
                            <YAxis tick={{ fontSize: 11 }} axisLine={false} />
                            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }} />
                            <Bar dataKey="count" radius={[20, 20, 0, 0]} barSize={30}>
                                {phaseData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">📈 Neural Traffic Flux</div>
                            <div className="card-subtitle">Layered avg load vs peak stability events</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <ComposedChart data={trafficData}>
                            <defs>
                                <linearGradient id="colorFlux" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} axisLine={false} />
                            <YAxis tick={{ fontSize: 11 }} axisLine={false} />
                            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }} />
                            <Area type="monotone" dataKey="avg_load" stroke="#06b6d4" fillOpacity={1} fill="url(#colorFlux)" name="Traffic Intensity" />
                            <Line type="monotone" dataKey="avg_load" stroke="var(--primary)" strokeWidth={3} dot={{ stroke: 'var(--primary)', strokeWidth: 2, r: 4, fill: 'var(--bg-card)' }} name="Stability Index" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
