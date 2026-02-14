export default function AuditCenter() {
    const logs = [
        { id: 1, event: 'Role Escalation', actor: 'Admin', target: 'John Doe', timestamp: '2024-02-14 10:20', detail: 'User promoted to Manager status via manual override.' },
        { id: 2, event: 'Stability Override', actor: 'Manager (A. Sharma)', target: 'Team Alpha', timestamp: '2024-02-14 09:15', detail: 'Forced completion of overdue tasks to meet quarterly deadline.' },
        { id: 3, event: 'User Suspension', actor: 'System (AI Guardian)', target: 'P. Kumar', timestamp: '2024-02-13 18:45', detail: 'Automated suspension due to consistent Phase 4 collapse risk.' },
        { id: 4, event: 'Database Backup', actor: 'System', target: 'N/A', timestamp: '2024-02-13 00:00', detail: 'Routine encrypted off-site backup completed successfully.' },
    ];

    const exportLogs = () => {
        const headers = 'Timestamp,Event,Actor,Target\n';
        const csv = logs.map(l => `${l.timestamp},${l.event},${l.actor},${l.target}`).join('\n');
        const blob = new Blob([headers + csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Audit_Log_${Date.now()}.csv`;
        a.click();
    };

    return (
        <div className="audit-center">
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">🔍 System Audit Center</div>
                        <div className="card-subtitle">Comprehensive logs of all identity, role, and stability interventions</div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={exportLogs}>Export Audit Log (CSV)</button>
                </div>

                <div className="data-table-container" style={{ marginTop: 25 }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Event Type</th>
                                <th>Actor</th>
                                <th>Target</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{log.timestamp}</td>
                                    <td style={{ fontWeight: 600 }}>{log.event}</td>
                                    <td>{log.actor}</td>
                                    <td>{log.target}</td>
                                    <td>
                                        <button
                                            className="btn btn-xs btn-ghost"
                                            onClick={() => alert(`FORENSIC DETAIL:\n${log.detail}`)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
