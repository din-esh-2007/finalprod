import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function RiskAlerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api('/manager/team-stability')
            .then(data => {
                // Filter for critical levels
                const critical = data.teamMetrics
                    .filter(e => e.burnout_phase >= 3)
                    .map(e => ({
                        id: e.id,
                        name: e.name,
                        type: e.burnout_phase === 4 ? 'Collapse Risk' : 'Volatility Alert',
                        severity: e.burnout_phase === 4 ? 'CRITICAL' : 'HIGH',
                        metric: `${Math.round(e.neural_load_index)}% Neural Load`,
                        suggestion: e.burnout_phase === 4 ? 'Immediate Work Stop' : 'Wellness Check Recommended'
                    }));
                setAlerts(critical);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="spinner"></div>;

    return (
        <div className="risk-alerts">
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">🚨 stability Risk Alerts</div>
                        <div className="card-subtitle">Real-time detection of performance collapse signals</div>
                    </div>
                </div>

                <div style={{ marginTop: 20 }}>
                    {alerts.length > 0 ? (
                        alerts.map(alert => (
                            <div key={alert.id} className={`alert-card ${alert.severity === 'CRITICAL' ? 'critical' : 'warning'}`}
                                style={{
                                    padding: 20,
                                    borderRadius: 12,
                                    background: alert.severity === 'CRITICAL' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                                    border: `1px solid ${alert.severity === 'CRITICAL' ? '#ef444433' : '#f59e0b33'}`,
                                    marginBottom: 15,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                                        <span className={`badge ${alert.severity === 'CRITICAL' ? 'error' : 'warning'}`}>{alert.severity}</span>
                                        <span style={{ fontWeight: 700, fontSize: 16 }}>{alert.name}</span>
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                        <strong>{alert.type}</strong>: {alert.metric}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: alert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b' }}>{alert.suggestion}</div>
                                    <button
                                        className={`btn btn-sm ${alert.severity === 'CRITICAL' ? 'btn-danger' : 'btn-warning'}`}
                                        style={{ marginTop: 10 }}
                                        onClick={() => alert(`🚀 Intervention Protocol initiated for ${alert.name}. ${alert.severity === 'CRITICAL' ? 'Mandatory rest notification sent.' : 'Wellness check scheduled.'}`)}
                                    >
                                        Take Action
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state" style={{ padding: '60px 0' }}>
                            <div style={{ fontSize: 40, marginBottom: 15 }}>✅</div>
                            <h3>No Critical Risks Detected</h3>
                            <p style={{ color: 'var(--text-muted)' }}>All team members are operating within stable cognitive parameters.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid-2" style={{ marginTop: 20 }}>
                <div className="card">
                    <div className="card-title" style={{ fontSize: 14, marginBottom: 10 }}>Detection Logic</div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        Alerts are triggered when an employee's <strong>Neural Load Index</strong> surpasses 70% while <strong>Adaptive Capacity</strong> falls below 40% for more than 2 consecutive hours.
                    </p>
                </div>
                <div className="card">
                    <div className="card-title" style={{ fontSize: 14, marginBottom: 10 }}>Intervention Protocol</div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        For <strong>CRITICAL</strong> alerts, the AI Guardian session is automatically escalated to a mandatory recovery protocol.
                    </p>
                </div>
            </div>
        </div>
    );
}
