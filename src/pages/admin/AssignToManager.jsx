import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function AssignToManager() {
    const [managers, setManagers] = useState([]);
    const [formData, setFormData] = useState({
        manager_id: '', title: '', description: '', priority: 'Medium', deadline: '', estimated_hours: ''
    });
    const [success, setSuccess] = useState('');

    useEffect(() => {
        api('/admin/managers').then(setManagers).catch(console.error);
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await api('/admin/assign-to-manager', { method: 'POST', body: formData });
            setSuccess('Work assigned to manager successfully! ✅');
            setFormData({ manager_id: '', title: '', description: '', priority: 'Medium', deadline: '', estimated_hours: '' });
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) { alert(err.message); }
    }

    return (
        <div className="card" style={{ maxWidth: 700 }}>
            <div className="card-header">
                <div>
                    <div className="card-title">📋 Assign Work to Manager</div>
                    <div className="card-subtitle">Admin assigns work ONLY to managers</div>
                </div>
            </div>

            {success && (
                <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, marginBottom: 20, color: 'var(--success-light)', fontSize: 14 }}>
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Manager</label>
                    <select className="form-select" required value={formData.manager_id}
                        onChange={e => setFormData({ ...formData, manager_id: e.target.value })}>
                        <option value="">Select Manager</option>
                        {managers.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Title</label>
                    <input className="form-input" required placeholder="Enter task title"
                        value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" placeholder="Describe the work in detail..."
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
                        <input type="number" className="form-input" step="0.5" min="0.5" placeholder="e.g., 20"
                            value={formData.estimated_hours}
                            onChange={e => setFormData({ ...formData, estimated_hours: e.target.value })} />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>📋 Assign to Manager</button>
            </form>
        </div>
    );
}
