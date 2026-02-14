import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function TaskReviews() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectModal, setRejectModal] = useState(null);
    const [reason, setReason] = useState('');

    useEffect(() => { loadSubmissions(); }, []);

    async function loadSubmissions() {
        try {
            const data = await api('/manager/submissions');
            setSubmissions(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    async function handleApprove(taskId) {
        try {
            await api(`/manager/tasks/${taskId}/approve`, { method: 'PUT' });
            loadSubmissions();
        } catch (e) { alert(e.message); }
    }

    async function handleReject() {
        try {
            await api(`/manager/tasks/${rejectModal}/reject`, { method: 'PUT', body: { reason } });
            setRejectModal(null);
            setReason('');
            loadSubmissions();
        } catch (e) { alert(e.message); }
    }

    if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

    return (
        <div>
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">✅ Task Submissions for Review</div>
                        <div className="card-subtitle">{submissions.length} submissions awaiting your review</div>
                    </div>
                </div>

                {submissions.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Task</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Summary</th>
                                    <th>Hours</th>
                                    <th>Submitted</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map(s => (
                                    <tr key={s.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.employee_name}</td>
                                        <td>{s.title}</td>
                                        <td><span className={`badge ${s.priority === 'High' || s.priority === 'Critical' ? 'error' : 'warning'}`}>{s.priority}</span></td>
                                        <td><span className="badge purple">{s.completion_status}</span></td>
                                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.work_summary}</td>
                                        <td>{s.hours_spent}h</td>
                                        <td style={{ fontSize: 12 }}>{new Date(s.submitted_at).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn btn-success btn-xs" onClick={() => handleApprove(s.task_id)}>✅ Approve</button>
                                                <button className="btn btn-danger btn-xs" onClick={() => setRejectModal(s.task_id)}>❌ Reject</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state"><div className="icon">✅</div><h3>No pending submissions</h3><p>All task submissions have been reviewed</p></div>
                )}
            </div>

            {rejectModal && (
                <div className="modal-overlay" onClick={() => setRejectModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>❌ Reject Task</h2>
                            <button className="modal-close" onClick={() => setRejectModal(null)}>×</button>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Rejection Reason</label>
                            <textarea className="form-textarea" placeholder="Explain why this task is being rejected..."
                                value={reason} onChange={e => setReason(e.target.value)} required />
                        </div>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost" onClick={() => setRejectModal(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleReject} disabled={!reason}>❌ Reject</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
