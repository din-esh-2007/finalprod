import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function AssignWork() {
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        employee_id: '', title: '', description: '', priority: 'Medium', deadline: '', estimated_hours: ''
    });
    const [success, setSuccess] = useState('');
    const [impact, setImpact] = useState(null);

    useEffect(() => {
        api('/manager/employees').then(setEmployees).catch(console.error);
    }, []);

    useEffect(() => {
        if (formData.employee_id && formData.estimated_hours) {
            // Simulate impact: more hours = more risk
            const baseImpact = Number(formData.estimated_hours) * 1.5;
            const priorityMultiplier = formData.priority === 'Critical' ? 2 : formData.priority === 'High' ? 1.5 : 1;
            setImpact(Math.round(baseImpact * priorityMultiplier));
        } else {
            setImpact(null);
        }
    }, [formData.employee_id, formData.estimated_hours, formData.priority]);

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await api('/manager/assign-task', { method: 'POST', body: formData });
            setSuccess('Task assigned successfully! ✅');
            setFormData({ employee_id: '', title: '', description: '', priority: 'Medium', deadline: '', estimated_hours: '' });
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) { alert(err.message); }
    }

    return (
        <div className="card" style={{ maxWidth: 700 }}>
            <div className="card-header">
                <div>
                    <div className="card-title">📋 Assign Work to Employee</div>
                    <div className="card-subtitle">Create and assign a new task</div>
                </div>
            </div>

            {success && (
                <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, marginBottom: 20, color: 'var(--success-light)', fontSize: 14 }}>
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Employee</label>
                    <select className="form-select" required value={formData.employee_id}
                        onChange={e => setFormData({ ...formData, employee_id: e.target.value })}>
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name} ({emp.username}) — {emp.position}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Task Title</label>
                    <input className="form-input" required placeholder="Enter task title"
                        value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" placeholder="Describe the task in detail..."
                        value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Priority</label>
                        <select className="form-select" value={formData.priority}
                            onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Deadline</label>
                        <input type="date" className="form-input" value={formData.deadline}
                            onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Estimated Hours</label>
                        <input type="number" className="form-input" placeholder="e.g., 8" required
                            value={formData.estimated_hours}
                            onChange={e => setFormData({ ...formData, estimated_hours: e.target.value })} />
                    </div>
                </div>

                {impact !== null && (
                    <div style={{ marginBottom: 20, padding: '12px 16px', background: impact > 25 ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)', borderRadius: 8, border: `1px solid ${impact > 25 ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.2)'}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 20 }}>🧠</span>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: impact > 25 ? '#ef4444' : 'var(--accent-light)' }}>
                                Assignment Stability Impact: +{impact}% Neural Load
                            </div>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                {impact > 25 ? 'Warning: This may push employee into a higher burnout phase.' : 'Stable: Impact is within normalized recovery range.'}
                            </p>
                        </div>
                    </div>
                )}

                <button type="submit" className="btn btn-primary">📋 Assign Task</button>
            </form>
        </div>
    );
}
