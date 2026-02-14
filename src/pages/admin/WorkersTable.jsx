import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

export default function WorkersTable() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [editModal, setEditModal] = useState(null);
    const [editData, setEditData] = useState({});
    const navigate = useNavigate();

    useEffect(() => { loadWorkers(); }, []);

    async function loadWorkers() {
        try {
            const data = await api('/admin/users');
            setWorkers(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    async function handleSuspend(id) {
        if (!confirm('Toggle suspension for this user?')) return;
        try {
            await api(`/admin/users/${id}/suspend`, { method: 'PUT' });
            loadWorkers();
        } catch (e) { alert(e.message); }
    }

    async function handleDelete(id) {
        if (!confirm('Are you sure you want to permanently delete this user? This cannot be undone.')) return;
        try {
            await api(`/admin/users/${id}`, { method: 'DELETE' });
            loadWorkers();
        } catch (e) { alert(e.message); }
    }

    async function handleEditSave() {
        try {
            await api(`/admin/users/${editModal}`, { method: 'PUT', body: editData });
            setEditModal(null);
            loadWorkers();
        } catch (e) { alert(e.message); }
    }

    const filtered = workers.filter(w => {
        if (filter === 'managers' && w.role !== 'MANAGER') return false;
        if (filter === 'employees' && w.role !== 'EMPLOYEE') return false;
        if (filter === 'suspended' && w.status !== 'suspended') return false;
        if (search && !w.name.toLowerCase().includes(search.toLowerCase()) && !w.username.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

    return (
        <div>
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">👥 All Workers</div>
                        <div className="card-subtitle">{workers.length} total users (Admin excluded)</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input className="form-input" placeholder="🔍 Search..." style={{ width: 200, padding: '8px 14px' }}
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                <div className="tabs" style={{ marginBottom: 16 }}>
                    {[
                        { key: 'all', label: `All (${workers.length})` },
                        { key: 'managers', label: `Managers (${workers.filter(w => w.role === 'MANAGER').length})` },
                        { key: 'employees', label: `Employees (${workers.filter(w => w.role === 'EMPLOYEE').length})` },
                        { key: 'suspended', label: `Suspended (${workers.filter(w => w.status === 'suspended').length})` },
                    ].map(t => (
                        <button key={t.key} className={`tab ${filter === t.key ? 'active' : ''}`} onClick={() => setFilter(t.key)}>
                            {t.label}
                        </button>
                    ))}
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Position</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(w => (
                                <tr key={w.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{w.name}</td>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>@{w.username}</td>
                                    <td><span className={`badge ${w.role === 'MANAGER' ? 'info' : 'purple'}`}>{w.role}</span></td>
                                    <td>{w.position || '—'}</td>
                                    <td><span className={`badge ${w.status === 'active' ? 'success' : 'error'}`}>{w.status}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                            <button className="btn btn-xs btn-ghost" onClick={() => navigate(`/admin/report/${w.id}`)}>
                                                📊 Report
                                            </button>
                                            <button className="btn btn-xs btn-ghost" onClick={() => {
                                                setEditModal(w.id);
                                                setEditData({ name: w.name, email: w.email, mobile: w.mobile, position: w.position, password: '' });
                                            }}>
                                                ✏️ Edit
                                            </button>
                                            <button className={`btn btn-xs ${w.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                                                onClick={() => handleSuspend(w.id)}>
                                                {w.status === 'active' ? '⏸️ Suspend' : '▶️ Activate'}
                                            </button>
                                            <button className="btn btn-xs btn-danger" onClick={() => handleDelete(w.id)}>
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editModal && (
                <div className="modal-overlay" onClick={() => setEditModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>✏️ Edit User</h2>
                            <button className="modal-close" onClick={() => setEditModal(null)}>×</button>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input className="form-input" value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input className="form-input" value={editData.email || ''} onChange={e => setEditData({ ...editData, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mobile</label>
                                <input className="form-input" value={editData.mobile || ''} onChange={e => setEditData({ ...editData, mobile: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Position</label>
                            <input className="form-input" value={editData.position || ''} onChange={e => setEditData({ ...editData, position: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Reset Password (leave blank to keep current)</label>
                            <input type="password" className="form-input" placeholder="New password..." value={editData.password || ''}
                                onChange={e => setEditData({ ...editData, password: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                            <button className="btn btn-ghost" onClick={() => setEditModal(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleEditSave}>💾 Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
