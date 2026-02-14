import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function EconomicImpact() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api('/admin/ai/economic-impact')
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="spinner"></div>;

    return (
        <div className="economic-impact">
            <div className="stats-grid">
                <div className="stat-card green">
                    <div className="stat-icon green">💰</div>
                    <div className="stat-value">${stats.lossAverted.toLocaleString()}</div>
                    <div className="stat-label">Loss Averted (Quarterly)</div>
                    <div style={{ marginTop: 10, fontSize: 11, color: 'var(--success)' }}>↑ 12% vs last month</div>
                </div>
                <div className="stat-card red">
                    <div className="stat-icon red">📉</div>
                    <div className="stat-value">${stats.burnoutCost.toLocaleString()}</div>
                    <div className="stat-label">Projected Burnout Cost</div>
                    <div style={{ marginTop: 10, fontSize: 11, color: 'var(--error)' }}>Calculated from sick days & churn</div>
                </div>
                <div className="stat-card cyan">
                    <div className="stat-icon cyan">📊</div>
                    <div className="stat-value">+{stats.productivityGain}%</div>
                    <div className="stat-label">Neural Productivity Gain</div>
                    <div style={{ marginTop: 10, fontSize: 11, color: 'var(--accent)' }}>Measured via flow-state analysis</div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-icon purple">✨</div>
                    <div className="stat-value">{stats.roi}x</div>
                    <div className="stat-label">Guardian Platform ROI</div>
                    <div style={{ marginTop: 10, fontSize: 11, color: 'var(--primary-light)' }}>Total value / Platform cost</div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">💵 Economic Analysis Logic</div>
                        <div className="card-subtitle">How AI calculates the cost of human fatigue</div>
                    </div>
                </div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 14 }}>
                    <p style={{ marginBottom: 15 }}>Our ML model correlates <strong>Neural Load Index (NLI)</strong> with historical task completion speeds and error rates. By detecting Phase 3-4 transitions before they occur, the system prevents "Silent Attrition" and reduced code quality.</p>
                    <div style={{ padding: 15, background: 'var(--bg-glass)', borderRadius: 8, borderLeft: '4px solid var(--primary)' }}>
                        <strong>AI Insight:</strong> Every 5% reduction in team-wide Neural Load corresponds to a projected $8,400 saving in technical debt and recruitment costs.
                    </div>
                </div>
            </div>
        </div>
    );
}
