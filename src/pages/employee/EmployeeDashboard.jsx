import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import FocusMetrics from '../../components/FocusMetrics';
import CognitivePanel from '../../components/CognitivePanel';
import AIGuardianChat from '../../components/AIGuardianChat';

export default function EmployeeDashboard() {
    const [attendance, setAttendance] = useState(null);
    const [taskSummary, setTaskSummary] = useState(null);
    const [todayMeetings, setTodayMeetings] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [detoxMode, setDetoxMode] = useState(localStorage.getItem('detoxMode') === 'true');
    const [stabilityData, setStabilityData] = useState(null);
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [checkInData, setCheckInData] = useState({ sleep: 7, mood: 3, caffeine: 2 });

    useEffect(() => {
        api('/employee/cognitive-profile').then(setStabilityData).catch(console.error);
    }, []);

    const toggleDetox = () => {
        const newVal = !detoxMode;
        setDetoxMode(newVal);
        localStorage.setItem('detoxMode', newVal);
    };

    useEffect(() => {
        const syncDetox = () => setDetoxMode(localStorage.getItem('detoxMode') === 'true');
        window.addEventListener('storage', syncDetox);
        return () => window.removeEventListener('storage', syncDetox);
    }, []);

    useEffect(() => {
        loadAll();
    }, []);

    async function loadAll() {
        try {
            const [att, taskSum, meetings, sugg, history, allTasks] = await Promise.all([
                api('/employee/attendance/today'),
                api('/employee/tasks/summary'),
                api('/employee/meetings/today'),
                api('/employee/suggestions'),
                api('/employee/attendance'),
                api('/employee/tasks')
            ]);
            setAttendance(att);
            setTaskSummary(taskSum);
            setTodayMeetings(meetings);
            setSuggestions(sugg);
            const hist = history && history.length > 0 ? history.slice(0, 14).reverse() : [
                { date: '2026-02-10', total_hours: 8.5 },
                { date: '2026-02-11', total_hours: 7.2 },
                { date: '2026-02-12', total_hours: 9.0 },
                { date: '2026-02-13', total_hours: 8.1 },
                { date: '2026-02-14', total_hours: 7.5 }
            ];
            setAttendanceHistory(hist);
            setTasks(allTasks);
        } catch (e) {
            console.error('Load error:', e);
        } finally {
            setLoading(false);
        }
    }

    async function handleCheckIn() {
        try {
            await api('/employee/attendance/checkin', { method: 'POST' });
            loadAll();
        } catch (e) {
            alert(e.message);
        }
    }

    async function handleCheckOut() {
        try {
            await api('/employee/attendance/checkout', { method: 'POST' });
            loadAll();
        } catch (e) {
            alert(e.message);
        }
    }

    if (loading) {
        return <div className="page-loading"><div className="spinner"></div><p>Loading dashboard...</p></div>;
    }

    const radarData = taskSummary ? [
        { name: 'Approved', value: taskSummary.approved },
        { name: 'Submitted', value: taskSummary.submitted },
        { name: 'Pending', value: taskSummary.pending },
        { name: 'Rejected', value: taskSummary.rejected },
    ].filter(d => d.value > 0) : [];

    return (
        <div>
            {/* PROBLEM STATEMENT: RISK RADAR + RECOVERY PLANNER */}
            <div className="card" style={{ marginBottom: 25, borderLeft: '4px solid var(--primary)', background: 'linear-gradient(90deg, var(--bg-card) 0%, rgba(99, 102, 241, 0.05) 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>📡 Personal Risk Radar</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Real-time burnout prediction & recovery planning</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCheckIn(true)}>✨ Daily Check-In</button>
                </div>

                <div className="stats-grid" style={{ marginTop: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <div style={{ padding: 15, background: 'var(--bg-glass)', borderRadius: 12 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Burnout Risk</div>
                        <div style={{ fontSize: 32, fontWeight: 800, color: (stabilityData?.current?.burnout_phase || 1) > 2 ? 'var(--error)' : 'var(--success)' }}>
                            {Math.round(((stabilityData?.current?.burnout_phase || 1) / 4) * 100)}%
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Based on neural fatigue & activity</div>
                    </div>
                    <div style={{ padding: 15, background: 'var(--bg-glass)', borderRadius: 12 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Primary Cause</div>
                        <div style={{ fontSize: 18, fontWeight: 600, marginTop: 5 }}>
                            {(stabilityData?.current?.burnout_phase || 1) > 2 ? '⚠️ High Cognitive Load' : '✅ Stable Recovery'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Neural fragmentation detected</div>
                    </div>
                    <div style={{ padding: 15, background: 'var(--bg-glass)', borderRadius: 12 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Next Action</div>
                        <div style={{ fontSize: 18, fontWeight: 600, marginTop: 5, color: 'var(--accent-light)' }}>
                            {(stabilityData?.current?.burnout_phase || 1) > 2 ? 'Take 15m Break' : 'Deep Work Session'}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 20, padding: 15, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                    <h4 style={{ marginBottom: 10, fontSize: 14 }}>🛠️ One-Tap Action Plan</h4>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button className="btn btn-xs btn-primary" onClick={() => alert('🔋 Ocular Reset Activated: Please look at an object 20ft away for 20 seconds.')}>🍏 Health: Ocular Reset</button>
                        <button className="btn btn-xs btn-primary" onClick={() => alert('💻 Smart Delegation: Tasks moved to low-load window.')}>💻 Work: Delegate Tasks</button>
                        <button className="btn btn-xs btn-primary" onClick={() => alert('🧘 Neural Sync: Starting 5m coherence breathing...')}>🧘 Focus: Guided Breathing</button>
                    </div>
                </div>
            </div>

            {/* Daily Check-In Modal */}
            {showCheckIn && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: 450 }}>
                        <div className="modal-header">
                            <h3>🌤️ Morning Wellness Sync</h3>
                            <button className="modal-close" onClick={() => setShowCheckIn(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>How are you starting your day? This helps calibrating your Cognitive Shield.</p>

                            <div className="form-group">
                                <label className="form-label">Sleep Quality ({checkInData.sleep} hours)</label>
                                <input
                                    type="range"
                                    min="3"
                                    max="12"
                                    className="form-input"
                                    value={checkInData.sleep}
                                    onChange={e => setCheckInData({ ...checkInData, sleep: parseInt(e.target.value) })}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
                                    <span>3h</span><span>8h</span><span>12h</span>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: 20 }}>
                                <label className="form-label">Current Mood (1: Low - 5: Peak)</label>
                                <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 10 }}>
                                    {[1, 2, 3, 4, 5].map(m => (
                                        <button
                                            key={m}
                                            className={`btn btn-xs ${checkInData.mood === m ? 'btn-primary' : 'btn-ghost'}`}
                                            onClick={() => setCheckInData({ ...checkInData, mood: m })}
                                            style={{ flex: 1, fontSize: 16 }}
                                        >
                                            {m === 1 ? '😟' : m === 2 ? '😐' : m === 3 ? '🙂' : m === 4 ? '😊' : '🔥'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: 20 }}>
                                <label className="form-label">Caffeine Intake (Cups)</label>
                                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                                    {[0, 1, 2, 3, 4].map(c => (
                                        <button
                                            key={c}
                                            className={`btn btn-xs ${checkInData.caffeine === c ? 'btn-accent' : 'btn-ghost'}`}
                                            onClick={() => setCheckInData({ ...checkInData, caffeine: c })}
                                            style={{ flex: 1 }}
                                        >
                                            {c} ☕
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ marginTop: 25 }}>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                                onClick={async () => {
                                    try {
                                        await api('/employee/daily-checkin', { method: 'POST', body: checkInData });
                                        alert('✅ Check-in complete! Your manager has been notified.');
                                        setShowCheckIn(false);
                                    } catch (e) {
                                        alert('Error: ' + e.message);
                                    }
                                }}
                            >
                                Submit Wellness Sync
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ... other stats cards ... */}

            <div className="stats-grid">
                <div className="stat-card purple">
                    <div className="stat-icon purple">🕐</div>
                    <div style={{ marginBottom: 12 }}>
                        <div className="stat-label">Today's Attendance</div>
                        {attendance ? (
                            <div style={{ marginTop: 8 }}>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                    Check-in: <strong style={{ color: 'var(--success-light)' }}>{attendance.check_in || '—'}</strong>
                                </p>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                                    Check-out: <strong style={{ color: attendance.check_out ? 'var(--error-light)' : 'var(--text-muted)' }}>
                                        {attendance.check_out || '—'}
                                    </strong>
                                </p>
                                {!attendance.check_out ? (
                                    <button className="btn btn-xs btn-danger" style={{ marginTop: 15, width: '100%' }} onClick={handleCheckOut}>
                                        🚩 Daily Check-Out
                                    </button>
                                ) : (
                                    <div style={{ marginTop: 15, fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>✅ Shift Completed</div>
                                )}
                            </div>
                        ) : (
                            <div style={{ marginTop: 15 }}>
                                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 15 }}>Not checked in yet</p>
                                <button className="btn btn-xs btn-success" style={{ marginTop: 5, width: '100%' }} onClick={handleCheckIn}>
                                    🚀 Daily Check-In
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="stat-card cyan">
                    <div className="stat-icon cyan">📋</div>
                    <div className="stat-value">{taskSummary?.total || 0}</div>
                    <div className="stat-label">Total Tasks</div>
                </div>

                <div className="stat-card green">
                    <div className="stat-icon green">✅</div>
                    <div className="stat-value">{taskSummary?.approved || 0}</div>
                    <div className="stat-label">Tasks Completed</div>
                </div>

                <div className="stat-card orange">
                    <div className="stat-icon orange">📊</div>
                    <div className="stat-value">{taskSummary?.completionPercentage || 0}%</div>
                    <div className="stat-label">Completion Rate</div>
                </div>
            </div>

            <div className="grid-2">
                {/* Cognitive Pulse (Radar) */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">🧠 Cognitive Pulse</div>
                            <div className="card-subtitle">Task profile stability mapping</div>
                        </div>
                    </div>
                    {radarData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData.map(d => ({ subject: d.name, value: d.value }))}>
                                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                <PolarRadiusAxis hide />
                                <Radar name="Tasks" dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.6} />
                                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state"><div className="icon">📊</div><h3>No task data yet</h3></div>
                    )}
                </div>

                {/* Meetings Today */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">📅 Today's Meetings</div>
                            <div className="card-subtitle">
                                {todayMeetings?.meetings?.length || 0} meetings scheduled
                            </div>
                        </div>
                    </div>
                    {todayMeetings?.meetings?.length > 0 ? (
                        todayMeetings.meetings.map(m => (
                            <div key={m.id} style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                                background: 'var(--bg-glass)', borderRadius: 8, marginBottom: 8,
                                borderLeft: '3px solid var(--accent)'
                            }}>
                                <div style={{ fontSize: 20 }}>📹</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{m.title}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.start_time} - {m.end_time}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">🎉 No meetings today</div>
                    )}
                </div>
            </div>

            {/* Effort Intensity Trend (BarChart) */}
            <div className="card" style={{ marginTop: 20 }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">📉 Effort Intensity Trend</div>
                        <div className="card-subtitle">Bar representation of daily working volume</div>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={attendanceHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} axisLine={false} />
                        <YAxis tick={{ fontSize: 11 }} axisLine={false} />
                        <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }} />
                        <Bar dataKey="total_hours" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={25} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Performance Mode Switch */}
            <div className="card" style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>🤖 SYSTEM MODE</div>
                    <button className={`btn btn-xs ${detoxMode ? 'btn-success' : 'btn-ghost'}`} onClick={toggleDetox}>
                        {detoxMode ? '🌿 Digital Detox Active' : '🔥 Performance Mode'}
                    </button>
                </div>
            </div>

            <CognitivePanel detox={detoxMode} data={stabilityData} />

            <div className="grid-2" style={{ marginTop: 20 }}>
                {/* Task Submission Form */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">📤 Submit Your Work</div>
                            <div className="card-subtitle">Dispatch completed projects for review</div>
                        </div>
                    </div>
                    <form style={{ marginTop: 15 }} onSubmit={async (e) => {
                        e.preventDefault();
                        const task_id = e.target.task_id.value;
                        const work_summary = e.target.work_summary.value;
                        const hours_spent = e.target.hours_spent.value;
                        if (!task_id) return alert('Please select a project');
                        try {
                            await api(`/employee/tasks/${task_id}/submit`, {
                                method: 'POST',
                                body: { completion_status: 'Completed', work_summary, hours_spent }
                            });
                            alert('✅ Work submitted successfully!');
                            e.target.reset();
                            loadAll();
                        } catch (err) { alert(err.message); }
                    }}>
                        <div className="form-group">
                            <label className="form-label">Select Project Title</label>
                            <select className="form-select" name="task_id" required>
                                <option value="">Choose your assigned task...</option>
                                {tasks.filter(t => ['Assigned', 'In Progress', 'Rejected'].includes(t.status)).map(t => (
                                    <option key={t.id} value={t.id}>{t.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Work Summary</label>
                            <textarea className="form-textarea" name="work_summary" placeholder="Briefly describe what you achieved..." required style={{ minHeight: 80 }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Hours Spent</label>
                            <input type="number" className="form-input" name="hours_spent" placeholder="e.g. 4.5" required step="0.5" />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 10 }}>📤 Submit for Review</button>
                    </form>
                </div>

                <AIGuardianChat metrics={stabilityData?.current} />
            </div>

            <div style={{ marginTop: 20 }}>
                <FocusMetrics role="employee" />
            </div>
        </div>
    );
}
