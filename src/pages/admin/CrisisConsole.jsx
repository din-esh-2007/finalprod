import { useState } from 'react';

export default function CrisisConsole() {
    const [status, setStatus] = useState('NORMAL');
    const [logs, setLogs] = useState([]);

    const triggerCrisis = (type) => {
        const isEmergency = type === 'lockdown';
        setStatus(isEmergency ? 'EMERGENCY' : 'WARN');
        const newLog = {
            id: Date.now(),
            type: isEmergency ? 'Wellness Stand-down' : 'Org-wide Wellness Alert',
            timestamp: new Date().toLocaleTimeString(),
            status: isEmergency ? 'ACTIVE' : 'SENT'
        };
        setLogs([newLog, ...logs]);
        alert(isEmergency
            ? 'CRITICAL PROTOCOL ACTIVATED: All non-essential services paused for neural recovery.'
            : 'BROADCAST SENT: Stability reinforcement protocol pushed to all dashboards.'
        );
    };

    return (
        <div className="crisis-console">
            <div className="card" style={{ border: status === 'EMERGENCY' ? '2px solid var(--error)' : status === 'WARN' ? '2px solid var(--warning)' : '1px solid var(--border)' }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">🆘 Organizational Crisis Console</div>
                        <div className="card-subtitle">Global intervention controls for sudden stability collapse</div>
                    </div>
                    <div className={`badge ${status === 'EMERGENCY' ? 'error' : status === 'WARN' ? 'warning' : 'success'}`} style={{ padding: '8px 15px' }}>
                        SYSTEM STATUS: {status}
                    </div>
                </div>

                <div className="grid-2" style={{ marginTop: 25 }}>
                    <div className="stat-card glass index-card" style={{ border: '1px solid var(--error-light)' }}>
                        <div style={{ fontSize: 30, marginBottom: 10 }}>🚨</div>
                        <div style={{ fontWeight: 700 }}>Trigger Wellness Stand-down</div>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>Force-close all non-critical tasks for 2 hours to allow neural normalization across the org.</p>
                        <button
                            className="btn btn-danger btn-block"
                            style={{ fontStyle: 'italic', fontWeight: 'bold', marginTop: 15 }}
                            onClick={() => triggerCrisis('lockdown')}
                        >
                            ACTIVATE LOCKDOWN
                        </button>
                    </div>

                    <div className="stat-card glass index-card" style={{ border: '1px solid var(--warning-light)' }}>
                        <div style={{ fontSize: 30, marginBottom: 10 }}>📢</div>
                        <div style={{ fontWeight: 700 }}>Org-wide Wellness Alert</div>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>Push a high-priority stability reminder and recovery protocol to all employee dashboards.</p>
                        <button
                            className="btn btn-warning btn-block"
                            style={{ fontWeight: 'bold', marginTop: 15 }}
                            onClick={() => triggerCrisis('broadcast')}
                        >
                            SEND BROADCAST
                        </button>
                    </div>
                </div>

                <div className="card" style={{ marginTop: 25, background: 'rgba(255,255,255,0.02)' }}>
                    <div className="card-title" style={{ fontSize: 14, marginBottom: 10 }}>Active Interventions</div>
                    {logs.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {logs.map(log => (
                                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 15px', background: 'var(--bg-glass)', borderRadius: 8, fontSize: 12 }}>
                                    <span><strong>{log.type}</strong> - {log.timestamp}</span>
                                    <span style={{ color: log.status === 'ACTIVE' ? 'var(--error)' : 'var(--success)', fontWeight: 700 }}>{log.status}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: 20 }}>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No active organizational-wide interventions at this time.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
