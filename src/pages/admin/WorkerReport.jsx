import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function WorkerReport() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [period, setPeriod] = useState('weekly');
    const [loading, setLoading] = useState(true);
    const chartRef = useRef(null);

    useEffect(() => { loadReport(); }, [id, period]);

    async function loadReport() {
        setLoading(true);
        try {
            const result = await api(`/admin/users/${id}/report?period=${period}`);
            setData(result);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    async function downloadPDF() {
        if (!data || !chartRef.current) return;

        try {
            const canvas = await html2canvas(chartRef.current, {
                backgroundColor: '#1a1a3e',
                scale: 2
            });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 190;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Header
            pdf.setFillColor(15, 15, 35);
            pdf.rect(0, 0, 210, 50, 'F');

            pdf.setTextColor(99, 102, 241);
            pdf.setFontSize(22);
            pdf.text('Burnout & Focus Guardian', 10, 20);

            pdf.setTextColor(148, 163, 184);
            pdf.setFontSize(12);
            pdf.text('Worker Performance Report', 10, 30);
            pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 10, 40);

            // Worker info
            pdf.setTextColor(33, 33, 33);
            pdf.setFontSize(14);
            let y = 60;
            pdf.text(`Name: ${data.user?.name}`, 10, y);
            pdf.text(`Role: ${data.user?.role}`, 10, y + 8);
            pdf.text(`Position: ${data.user?.position}`, 10, y + 16);
            pdf.text(`Status: ${data.user?.status}`, 10, y + 24);

            // Summary
            y = 100;
            pdf.setFontSize(16);
            pdf.setTextColor(99, 102, 241);
            pdf.text('Summary', 10, y);

            pdf.setFontSize(12);
            pdf.setTextColor(33, 33, 33);
            pdf.text(`Total Work Hours: ${data.summary?.totalHours}h`, 10, y + 12);
            pdf.text(`Average Hours/Day: ${data.summary?.avgHoursPerDay}h`, 10, y + 22);
            pdf.text(`Total Tasks Completed: ${data.summary?.totalCompleted}`, 10, y + 32);
            pdf.text(`Period: ${period}`, 10, y + 42);

            // Chart image
            y = 155;
            pdf.setFontSize(16);
            pdf.setTextColor(99, 102, 241);
            pdf.text('Performance Chart', 10, y);

            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 10, y + 5, imgWidth, Math.min(imgHeight, 100));

            pdf.save(`${data.user?.name?.replace(/\s/g, '_')}_Report.pdf`);
        } catch (e) {
            console.error('PDF error:', e);
            alert('Failed to generate PDF');
        }
    }

    if (loading) return <div className="page-loading"><div className="spinner"></div></div>;
    if (!data) return <div className="empty-state"><h3>Report not found</h3></div>;

    // Merge attendance and tasks for chart
    const chartData = data.attendance?.map(a => {
        const taskDay = data.completedTasks?.find(t => t.date === a.date);
        return {
            date: a.date.slice(5),
            hours: a.total_hours,
            tasks: taskDay?.count || 0
        };
    }) || [];

    return (
        <div>
            {/* Worker Info Card */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div className="user-avatar" style={{ width: 56, height: 56, fontSize: 22 }}>
                            {data.user?.name?.charAt(0)}
                        </div>
                        <div>
                            <div className="card-title" style={{ fontSize: 20 }}>{data.user?.name}</div>
                            <div className="card-subtitle">
                                <span className={`badge ${data.user?.role === 'MANAGER' ? 'info' : 'purple'}`}>{data.user?.role}</span>
                                <span className="badge neutral" style={{ marginLeft: 8 }}>{data.user?.position}</span>
                                <span className={`badge ${data.user?.status === 'active' ? 'success' : 'error'}`} style={{ marginLeft: 8 }}>{data.user?.status}</span>
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={downloadPDF}>
                        📥 Download Report as PDF
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="stats-grid">
                <div className="stat-card purple">
                    <div className="stat-icon purple">⏱️</div>
                    <div className="stat-value">{data.summary?.totalHours}h</div>
                    <div className="stat-label">Total Work Hours</div>
                </div>
                <div className="stat-card cyan">
                    <div className="stat-icon cyan">📊</div>
                    <div className="stat-value">{data.summary?.avgHoursPerDay}h</div>
                    <div className="stat-label">Avg Hours/Day</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon green">✅</div>
                    <div className="stat-value">{data.summary?.totalCompleted}</div>
                    <div className="stat-label">Tasks Completed</div>
                </div>
            </div>

            {/* Chart */}
            <div className="card" ref={chartRef}>
                <div className="card-header">
                    <div>
                        <div className="card-title">📊 Performance Chart</div>
                        <div className="card-subtitle">Work Hours & Tasks Completed</div>
                    </div>
                    <div className="tabs">
                        {['weekly', 'monthly'].map(p => (
                            <button key={p} className={`tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f1f5f9' }} />
                            <Legend />
                            <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} name="Work Hours" />
                            <Bar dataKey="tasks" fill="#10b981" radius={[4, 4, 0, 0]} name="Tasks Completed" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="empty-state"><div className="icon">📊</div><h3>No data for this period</h3></div>
                )}
            </div>
        </div>
    );
}
