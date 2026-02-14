import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function CreateUser() {
    const [managers, setManagers] = useState([]);
    const [formData, setFormData] = useState({
        name: '', username: '', email: '', mobile: '', password: '', role: 'EMPLOYEE', position: '', manager_id: ''
    });
    const [success, setSuccess] = useState('');

    const positions = [
        'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer',
        'QA Tester', 'DevOps Engineer', 'Data Analyst', 'Mobile Developer', 'Support Engineer', 'Intern'
    ];

    useEffect(() => {
        api('/admin/managers').then(setManagers).catch(console.error);
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const body = { ...formData };
            if (body.role === 'MANAGER') {
                body.position = 'Manager';
                body.manager_id = null;
            }
            await api('/admin/users', { method: 'POST', body });
            setSuccess(`${formData.role === 'MANAGER' ? 'Manager' : 'Employee'} "${formData.name}" created successfully! ✅`);
            setFormData({ name: '', username: '', email: '', mobile: '', password: '', role: 'EMPLOYEE', position: '', manager_id: '' });
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) { alert(err.message); }
    }

    return (
        <div className="card" style={{ maxWidth: 700 }}>
            <div className="card-header">
                <div>
                    <div className="card-title">➕ Create New User</div>
                    <div className="card-subtitle">Only Admin can create accounts. No public registration.</div>
                </div>
            </div>

            {success && (
                <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, marginBottom: 20, color: 'var(--success-light)', fontSize: 14 }}>
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" required placeholder="Enter full name"
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input className="form-input" required placeholder="unique_username"
                            value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-input" required placeholder="Set password"
                            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-input" placeholder="email@company.com"
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Mobile</label>
                        <input className="form-input" placeholder="9876543210"
                            value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-select" value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value, position: e.target.value === 'MANAGER' ? 'Manager' : '' })}>
                        <option value="EMPLOYEE">Employee</option>
                        <option value="MANAGER">Manager</option>
                    </select>
                </div>

                {formData.role === 'EMPLOYEE' && (
                    <>
                        <div className="form-group">
                            <label className="form-label">Position</label>
                            <select className="form-select" required value={formData.position}
                                onChange={e => setFormData({ ...formData, position: e.target.value })}>
                                <option value="">Select Position</option>
                                {positions.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Assign to Manager</label>
                            <select className="form-select" value={formData.manager_id}
                                onChange={e => setFormData({ ...formData, manager_id: e.target.value })}>
                                <option value="">Select Manager</option>
                                {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                    </>
                )}

                <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>➕ Create User</button>
            </form>
        </div>
    );
}
