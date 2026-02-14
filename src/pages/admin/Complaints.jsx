import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function Complaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api('/admin/complaints').then(setComplaints).catch(console.error).finally(() => setLoading(false));
    }, []);

    const getSeverityBadge = (severity) => {
        const map = { Low: 'info', Medium: 'warning', High: 'error', Critical: 'error' };
        return <span className={`badge ${map[severity] || 'neutral'}`}>{severity}</span>;
    };

    if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

    return (
        <div className="card">
            <div className="card-header">
                <div>
                    <div className="card-title">⚠️ Complaints</div>
                    <div className="card-subtitle">{complaints.length} total complaints</div>
                </div>
            </div>

            {complaints.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Raised By</th>
                                <th>About</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Severity</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complaints.map(c => (
                                <tr key={c.id}>
                                    <td style={{ fontFamily: 'monospace' }}>#{c.id}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.raised_by_name}</td>
                                    <td style={{ fontWeight: 500 }}>{c.about_user_name}</td>
                                    <td><span className="badge neutral">{c.category}</span></td>
                                    <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</td>
                                    <td>{getSeverityBadge(c.severity)}</td>
                                    <td><span className={`badge ${c.status === 'Open' ? 'warning' : 'success'}`}>{c.status}</span></td>
                                    <td style={{ fontSize: 12 }}>{new Date(c.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state"><div className="icon">✅</div><h3>No complaints</h3></div>
            )}
        </div>
    );
}
