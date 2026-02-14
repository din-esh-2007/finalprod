import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function RaiseComplaint() {
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        employee_id: '', category: '', description: '', severity: 'Medium'
    });
    const [success, setSuccess] = useState('');

    const categories = ['Performance', 'Behavior', 'Attendance', 'Communication', 'Work Quality', 'Policy Violation'];

    useEffect(() => {
        api('/manager/employees').then(setEmployees).catch(console.error);
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await api('/manager/complaints', { method: 'POST', body: formData });
            setSuccess('Complaint raised successfully! Admin will review it.');
            setFormData({ employee_id: '', category: '', description: '', severity: 'Medium' });
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) { alert(err.message); }
    }

    return (
        <div className="card" style={{ maxWidth: 700 }}>
            <div className="card-header">
                <div>
                    <div className="card-title">⚠️ Raise Complaint</div>
                    <div className="card-subtitle">Report an issue about an employee to Admin</div>
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
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select className="form-select" required value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}>
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Severity</label>
                        <select className="form-select" value={formData.severity}
                            onChange={e => setFormData({ ...formData, severity: e.target.value })}>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" required placeholder="Describe the issue in detail..."
                        value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <button type="submit" className="btn btn-warning" style={{ marginTop: 8 }}>⚠️ Submit Complaint</button>
            </form>
        </div>
    );
}
