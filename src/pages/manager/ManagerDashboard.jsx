import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import TeamStability from '../../components/TeamStability';
import { generatePDFReport } from '../../utils/reportGenerator';

export default function ManagerDashboard() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        api('/manager/employees')
            .then(setEmployees)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleDownload = async () => {
        setGenerating(true);
        try {
            await generatePDFReport('report-content', { role: 'Manager', title: 'Team Performance & Stability Report' });
        } catch (e) {
            alert('Failed to generate report');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="page-loading"><div className="spinner"></div><p>Loading dashboard...</p></div>;

    const totalEmployees = employees.length;
    const avgCompletion = employees.length > 0
        ? Math.round(employees.reduce((s, e) => s + e.completionPercentage, 0) / employees.length)
        : 0;
    const totalApproved = employees.reduce((s, e) => s + e.approvedTasks, 0);
    const totalPending = employees.reduce((s, e) => s + e.pendingTasks, 0);

    const chartData = employees.length > 0
        ? employees.slice(0, 10).map(e => ({
            name: e.name ? e.name.split(' ')[0] : 'User',
            completed: e.approvedTasks,
            pending: e.pendingTasks,
            hours: e.todayHours
        }))
        : [
            { name: 'Emp 1', completed: 5, pending: 2, hours: 8 },
            { name: 'Emp 2', completed: 3, pending: 4, hours: 9 },
            { name: 'Emp 3', completed: 7, pending: 1, hours: 7.5 },
            { name: 'Emp 4', completed: 4, pending: 3, hours: 8.2 },
        ];

    const scatterData = employees.length > 0
        ? employees.map(e => ({
            x: e.completionPercentage,
            y: Math.max(20, 100 - (e.approvedTasks * 10)), // Simulated stability
            name: e.name,
            z: e.todayHours
        }))
        : [
            { x: 80, y: 70, name: 'Emp 1', z: 8 },
            { x: 45, y: 30, name: 'Emp 2', z: 9 },
            { x: 90, y: 85, name: 'Emp 3', z: 7 },
            { x: 60, y: 55, name: 'Emp 4', z: 8 },
        ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                <button
                    className="btn btn-primary"
                    onClick={handleDownload}
                    disabled={generating}
                >
                    {generating ? '⌛ Generating...' : '📜 Download Team Report (PDF)'}
                </button>
            </div>
            <div className="stats-grid">
                <div className="stat-card purple">
                    <div className="stat-icon purple">👥</div>
                    <div className="stat-value">{totalEmployees}</div>
                    <div className="stat-label">My Employees</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon green">✅</div>
                    <div className="stat-value">{totalApproved}</div>
                    <div className="stat-label">Total Tasks Approved</div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-icon orange">⏳</div>
                    <div className="stat-value">{totalPending}</div>
                    <div className="stat-label">Pending Tasks</div>
                </div>
                <div className="stat-card cyan">
                    <div className="stat-icon cyan">📊</div>
                    <div className="stat-value">{avgCompletion}%</div>
                    <div className="stat-label">Avg Completion Rate</div>
                </div>
            </div>

            {/* Team Cognitive Stability Map */}
            <TeamStability />

            <div className="grid-2" style={{ marginTop: 20 }}>
                {/* Performance Chart */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">📉 Task Velocity vs Effort</div>
                            <div className="card-subtitle">Mixed view of output (tasks) vs effort (hours)</div>
                        </div>
                    </div>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} />
                                <YAxis yAxisId="left" tick={{ fontSize: 11 }} axisLine={false} />
                                <YAxis yAxisId="right" orientation="right" hide />
                                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" barSize={15} />
                                <Line yAxisId="left" type="monotone" dataKey="hours" stroke="var(--accent)" strokeWidth={2} name="Work Hours" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    ) : null}
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">🎯 Stability vs Delivery</div>
                            <div className="card-subtitle">Mapping employees on the cognitive risk grid</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis type="number" dataKey="x" name="Completion" unit="%" axisLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                            <YAxis type="number" dataKey="y" name="Stability" unit="%" axisLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                            <ZAxis type="number" dataKey="z" range={[60, 400]} name="Hours" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
                            <Scatter name="Employees" data={scatterData} fill="var(--primary)">
                                {scatterData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.y < 50 ? 'var(--error)' : 'var(--success)'} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid-2">
                {/* Employee Overview */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">👥 Employee List</div>
                            <div className="card-subtitle">Snapshot of your team</div>
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Hours</th>
                                    <th>Progress</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.slice(0, 5).map(emp => (
                                    <tr key={emp.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</td>
                                        <td>{emp.todayHours}h</td>
                                        <td>
                                            <div className="progress-bar" style={{ width: 50, height: 4 }}>
                                                <div className="progress-fill" style={{ width: `${emp.completionPercentage}%` }}></div>
                                            </div>
                                        </td>
                                        <td>
                                            <button className="btn btn-xs btn-ghost" onClick={() => navigate(`/manager/analytics/${emp.id}`)}>📊</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {employees.length > 5 && (
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
                                + {employees.length - 5} more employees
                            </p>
                        )}
                    </div>
                </div>

                {/* Tasks from Admin */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">🛡️ Tasks from Admin</div>
                            <div className="card-subtitle">Directives assigned to you by System Admin</div>
                        </div>
                    </div>
                    <AdminTasksList />
                </div>
            </div>
        </div>
    );
}

function AdminTasksList() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api('/manager/calendar')
            .then(data => {
                setTasks(data.filter(t => t.type === 'admin_task'));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="spinner" style={{ width: 24, height: 24, margin: '20px auto' }}></div>;

    return (
        <div style={{ maxHeight: 320, overflowY: 'auto', paddingRight: 4 }}>
            {tasks.length > 0 ? (
                tasks.map(t => (
                    <div key={t.id} style={{
                        padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 10, marginBottom: 8,
                        borderLeft: `4px solid ${t.priority === 'Critical' ? 'var(--error)' : t.priority === 'High' ? 'var(--warning)' : 'var(--accent)'}`,
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                            <span>📅 {t.date}</span>
                            <span className={`badge ${t.priority === 'Critical' ? 'error' : 'info'}`} style={{ fontSize: 9 }}>{t.priority}</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="empty-state" style={{ padding: '40px 20px' }}>
                    <div className="icon" style={{ fontSize: 24 }}>🛡️</div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No active tasks from Admin</p>
                </div>
            )}
        </div>
    );
}
