import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitModal, setSubmitModal] = useState(null);
    const [formData, setFormData] = useState({ completion_status: 'Completed', work_summary: '', hours_spent: '' });

    useEffect(() => { loadTasks(); }, []);

    async function loadTasks() {
        try {
            const data = await api('/employee/tasks');
            setTasks(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await api(`/employee/tasks/${submitModal.id}/submit`, {
                method: 'POST',
                body: formData
            });
            setSubmitModal(null);
            setFormData({ completion_status: 'Completed', work_summary: '', hours_spent: '' });
            loadTasks();
        } catch (err) {
            alert(err.message);
        }
    }

    const getStatusBadge = (status) => {
        const map = {
            'Assigned': 'info',
            'In Progress': 'warning',
            'Submitted': 'purple',
            'Approved': 'success',
            'Rejected': 'error'
        };
        return <span className={`badge ${map[status] || 'neutral'}`}>{status}</span>;
    };

    const getPriorityBadge = (priority) => {
        const map = { 'Low': 'info', 'Medium': 'warning', 'High': 'error', 'Critical': 'error' };
        return <span className={`badge ${map[priority] || 'neutral'}`}>{priority}</span>;
    };

    if (loading) return <div className="page-loading"><div className="spinner"></div><p>Loading tasks...</p></div>;

    return (
        <div>
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">📋 My Tasks</div>
                        <div className="card-subtitle">{tasks.length} total tasks</div>
                    </div>
                </div>

                {tasks.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Deadline</th>
                                    <th>Priority</th>
                                    <th>Est. Hours</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => (
                                    <tr key={task.id}>
                                        <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{task.id}</td>
                                        <td style={{ fontWeight: 500, color: 'var(--text-primary)', maxWidth: 300 }}>{task.title}</td>
                                        <td>{task.deadline || '—'}</td>
                                        <td>{getPriorityBadge(task.priority)}</td>
                                        <td>{task.estimated_hours || '—'}h</td>
                                        <td>{getStatusBadge(task.status)}</td>
                                        <td>
                                            {['Assigned', 'In Progress', 'Rejected'].includes(task.status) && (
                                                <button className="btn btn-primary btn-xs" onClick={() => setSubmitModal(task)}>
                                                    📤 Submit
                                                </button>
                                            )}
                                            {task.status === 'Approved' && <span className="badge success">✅ Approved by Manager</span>}
                                            {task.status === 'Submitted' && <span className="badge purple">⏳ Awaiting Review</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state"><div className="icon">📋</div><h3>No tasks assigned</h3><p>Your manager will assign tasks to you.</p></div>
                )}
            </div>

            {/* Submit Modal */}
            {submitModal && (
                <div className="modal-overlay" onClick={() => setSubmitModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📤 Submit Task</h2>
                            <button className="modal-close" onClick={() => setSubmitModal(null)}>×</button>
                        </div>

                        <div style={{ padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 8, marginBottom: 20 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{submitModal.title}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Task #{submitModal.id} • Priority: {submitModal.priority}</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Completion Status</label>
                                <select className="form-select" value={formData.completion_status}
                                    onChange={e => setFormData({ ...formData, completion_status: e.target.value })}>
                                    <option value="Completed">Completed</option>
                                    <option value="Partial">Partial Completion</option>
                                    <option value="Blocked">Blocked</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Work Summary</label>
                                <textarea className="form-textarea" placeholder="Describe the work you completed..."
                                    value={formData.work_summary} required
                                    onChange={e => setFormData({ ...formData, work_summary: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Hours Spent</label>
                                <input type="number" className="form-input" step="0.5" min="0.5" placeholder="e.g., 4.5"
                                    value={formData.hours_spent} required
                                    onChange={e => setFormData({ ...formData, hours_spent: e.target.value })} />
                            </div>

                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setSubmitModal(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">📤 Submit Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
