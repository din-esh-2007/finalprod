import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import FocusMetrics from '../../components/FocusMetrics';

export default function EmployeeAnalytics() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [period, setPeriod] = useState('week');
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, [id, period]);

    async function loadData() {
        setLoading(true);
        try {
            const result = await api(`/manager/employees/${id}/analytics?period=${period}`);
            setData(result);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="page-loading"><div className="spinner"></div><p>Loading analytics...</p></div>;

    // Merge attendance and tasks into a single dataset
    const chartData = data?.attendance?.map(a => {
        const taskDay = data.completedTasks?.find(t => t.date === a.date);
        return {
            date: a.date.slice(5),
            hours: a.total_hours,
            tasks: taskDay?.count || 0
        };
    }) || [];

    return (
        <div>
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">📊 Analytics for {data?.employee?.name || 'Employee'}</div>
                        <div className="card-subtitle">{data?.employee?.position} • {data?.employee?.email}</div>
                    </div>
                    <div className="tabs">
                        {['day', 'week', 'month'].map(p => (
                            <button key={p} className={`tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
                                1 {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }} />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} name="Work Hours" />
                            <Line yAxisId="right" type="monotone" dataKey="tasks" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} name="Tasks Completed" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="empty-state"><div className="icon">📊</div><h3>No data for this period</h3><p>Try selecting a different time range</p></div>
                )}
            </div>

            {/* Behavioral Analytics */}
            <FocusMetrics employeeId={id} role="manager" />
        </div>
    );
}
