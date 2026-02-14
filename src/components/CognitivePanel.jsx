import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CognitivePanel({ detox, data }) {
    if (!data?.current) return null;

    const { current, phase, history } = data;

    if (detox) {
        return (
            <div className="card cognitive-panel" style={{ marginTop: 20, border: `1px solid ${phase.color}33`, textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 50, marginBottom: 20 }}>🌿</div>
                <div className="card-title" style={{ fontSize: 24, marginBottom: 10 }}>Focusing on Recovery...</div>
                <div className="card-subtitle" style={{ fontSize: 16 }}>Your Stability Score: <strong style={{ color: phase.color }}>{Math.round(current.adaptive_capacity_score)}%</strong></div>
                <p style={{ marginTop: 20, color: 'var(--text-muted)', maxWidth: 400, margin: '20px auto' }}>
                    Digital Detox Mode is active. We've hidden high-stimulus analytics to help you focus on normalization.
                    <strong> Insight:</strong> {phase.desc}
                </p>
            </div>
        );
    }

    return (
        <div className="card cognitive-panel" style={{ marginTop: 20, border: `1px solid ${phase.color}33` }}>
            <div className="card-header">
                <div>
                    <div className="card-title">🧠 Cognitive Stability Intelligence</div>
                    <div className="card-subtitle">Real-time mental load & phase classification</div>
                </div>
                <div className="badge" style={{ background: `${phase.color}22`, color: phase.color, border: `1px solid ${phase.color}44`, padding: '6px 12px', fontSize: 13, fontWeight: 700 }}>
                    {phase.name}
                </div>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginTop: 20 }}>
                <div className="stat-card glass index-card">
                    <div className="label">Neural Load Index</div>
                    <div className="value" style={{ color: current.neural_load_index > 70 ? 'var(--error)' : 'var(--text-primary)' }}>
                        {Math.round(current.neural_load_index)}%
                    </div>
                    <div className="progress-bar mini"><div className="progress-fill" style={{ width: `${current.neural_load_index}%`, background: 'var(--accent)' }}></div></div>
                </div>
                <div className="stat-card glass index-card">
                    <div className="label">Fragmentation</div>
                    <div className="value">{Math.round(current.fragmentation_index)}%</div>
                    <div className="progress-bar mini"><div className="progress-fill" style={{ width: `${current.fragmentation_index}%`, background: 'var(--warning)' }}></div></div>
                </div>
                <div className="stat-card glass index-card">
                    <div className="label">Latent Stress</div>
                    <div className="value">{Math.round(current.latent_stress_index)}%</div>
                    <div className="progress-bar mini"><div className="progress-fill" style={{ width: `${current.latent_stress_index}%`, background: 'var(--error)' }}></div></div>
                </div>
                <div className="stat-card glass index-card">
                    <div className="label">Adaptive Capacity</div>
                    <div className="value" style={{ color: 'var(--success-light)' }}>{Math.round(current.adaptive_capacity_score)}%</div>
                    <div className="progress-bar mini"><div className="progress-fill" style={{ width: `${current.adaptive_capacity_score}%`, background: 'var(--success)' }}></div></div>
                </div>
            </div>

            <div style={{ marginTop: 25, padding: 15, background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                <h4 style={{ fontSize: 13, marginBottom: 15, color: 'var(--text-muted)' }}>Stability Trend (Last 24 Data Points)</h4>
                <ResponsiveContainer width="100%" height={150}>
                    <AreaChart data={history}>
                        <defs>
                            <linearGradient id="colorNeural" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="date" hide />
                        <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }} />
                        <Area type="monotone" dataKey="neural_load_index" stroke="var(--accent)" fillOpacity={1} fill="url(#colorNeural)" name="Neural Load" />
                        <Area type="monotone" dataKey="latent_stress_index" stroke="var(--error)" fill="transparent" name="Stress" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div style={{ marginTop: 15, display: 'flex', alignItems: 'flex-start', gap: 12, padding: 15, background: `${phase.color}11`, borderRadius: 10, border: `1px solid ${phase.color}22` }}>
                <span style={{ fontSize: 20 }}>💡</span>
                <div>
                    <div style={{ fontWeight: 600, color: phase.color, fontSize: 14 }}>Guardian Insight: {phase.name}</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>{phase.desc}</p>
                </div>
            </div>
        </div>
    );
}
