import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function Meetings() {
    const [meetings, setMeetings] = useState([]);
    const [todayData, setTodayData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api('/employee/meetings'),
            api('/employee/meetings/today')
        ]).then(([all, today]) => {
            setMeetings(all);
            setTodayData(today);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="page-loading"><div className="spinner"></div><p>Loading meetings...</p></div>;

    return (
        <div>
            {/* Today's Summary */}
            <div className="stats-grid">
                <div className="stat-card cyan">
                    <div className="stat-icon cyan">📅</div>
                    <div className="stat-value">{todayData?.meetings?.length || 0}</div>
                    <div className="stat-label">Today's Meetings</div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-icon purple">⏱️</div>
                    <div className="stat-value">{Math.round((todayData?.totalMinutes || 0) / 60 * 10) / 10}h</div>
                    <div className="stat-label">Total Meeting Hours</div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-icon orange">📊</div>
                    <div className="stat-value">{meetings.length}</div>
                    <div className="stat-label">All Meetings</div>
                </div>
            </div>

            {todayData?.meetingHeavy && (
                <div className="meeting-heavy-alert">
                    ⚠️ <strong>Meeting Heavy Day!</strong> You have more than 4 meetings today. Consider blocking focus time for deep work.
                </div>
            )}

            {/* Today's Meetings */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">📅 Today's Meetings</div>
                        <div className="card-subtitle">{todayData?.meetings?.length || 0} meetings scheduled</div>
                    </div>
                </div>
                {todayData?.meetings?.length > 0 ? (
                    todayData.meetings.map(m => (
                        <div key={m.id} style={{
                            display: 'flex', alignItems: 'center', gap: 16, padding: '16px',
                            background: 'var(--bg-glass)', borderRadius: 12, marginBottom: 10,
                            borderLeft: '4px solid var(--accent)', transition: 'var(--transition)'
                        }}>
                            <div style={{ fontSize: 32 }}>📹</div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{m.title}</h4>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{m.description}</p>
                                <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                                    <span className="badge info">🕐 {m.start_time} - {m.end_time}</span>
                                    <span className="badge neutral">⏱️ {m.duration_minutes}min</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state" style={{ padding: 40 }}><div className="icon">🎉</div><h3>No meetings today!</h3><p>Focus on your tasks</p></div>
                )}
            </div>

            {/* All Meetings */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">📋 All Meetings</div>
                        <div className="card-subtitle">Complete meeting history</div>
                    </div>
                </div>
                {meetings.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Date</th>
                                    <th>Start</th>
                                    <th>End</th>
                                    <th>Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {meetings.map(m => (
                                    <tr key={m.id}>
                                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{m.title}</td>
                                        <td>{m.date}</td>
                                        <td>{m.start_time}</td>
                                        <td>{m.end_time}</td>
                                        <td><span className="badge info">{m.duration_minutes}min</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state"><div className="icon">📅</div><h3>No meetings</h3></div>
                )}
            </div>
        </div>
    );
}
