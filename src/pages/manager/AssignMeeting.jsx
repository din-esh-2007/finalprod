import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function AssignMeeting() {
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        employee_id: '', title: '', date: '', start_time: '', end_time: '', description: ''
    });
    const [success, setSuccess] = useState('');

    useEffect(() => {
        api('/manager/employees').then(setEmployees).catch(console.error);
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await api('/manager/assign-meeting', { method: 'POST', body: formData });
            setSuccess('Meeting assigned successfully! ✅');
            setFormData({ employee_id: '', title: '', date: '', start_time: '', end_time: '', description: '' });
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) { alert(err.message); }
    }

    return (
        <div className="card" style={{ maxWidth: 700 }}>
            <div className="card-header">
                <div>
                    <div className="card-title">📅 Assign Meeting</div>
                    <div className="card-subtitle">Schedule a meeting for an employee</div>
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
                    <label className="form-label">Meeting Title</label>
                    <input className="form-input" placeholder="e.g., Sprint Planning" required
                        value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input type="date" className="form-input" required value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Start Time</label>
                        <input type="time" className="form-input" required value={formData.start_time}
                            onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">End Time</label>
                        <input type="time" className="form-input" required value={formData.end_time}
                            onChange={e => setFormData({ ...formData, end_time: e.target.value })} />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" placeholder="Meeting agenda and details..."
                        value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>📅 Schedule Meeting</button>
            </form>
        </div>
    );
}
