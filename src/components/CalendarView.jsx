import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView({ apiPrefix = '/employee' }) {
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        api(`${apiPrefix}/calendar`)
            .then(setEvents)
            .catch(console.error);
    }, [apiPrefix]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const today = new Date().toISOString().split('T')[0];

    const cells = [];

    // Previous month
    for (let i = firstDay - 1; i >= 0; i--) {
        cells.push({ day: daysInPrevMonth - i, otherMonth: true, date: null });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayEvents = events.filter(e => e.date === dateStr);
        cells.push({ day: d, otherMonth: false, date: dateStr, events: dayEvents, isToday: dateStr === today });
    }

    // Next month
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
        cells.push({ day: i, otherMonth: true, date: null });
    }

    return (
        <div className="card">
            <div className="card-header">
                <div>
                    <div className="card-title">🗓️ Calendar</div>
                    <div className="card-subtitle">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>← Prev</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(new Date())}>Today</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>Next →</button>
                </div>
            </div>

            <div className="calendar-grid">
                {DAYS.map(d => (
                    <div key={d} className="calendar-header-cell">{d}</div>
                ))}
                {cells.map((cell, i) => (
                    <div key={i} className={`calendar-cell ${cell.otherMonth ? 'other-month' : ''} ${cell.isToday ? 'today' : ''}`}>
                        <div className="calendar-date">{cell.day}</div>
                        {cell.events?.slice(0, 3).map((e, j) => (
                            <div
                                key={j}
                                className={`calendar-event ${e.type === 'meeting' ? 'meeting' : e.priority === 'High' || e.priority === 'Critical' ? 'high' : 'task'}`}
                                title={e.title}
                            >
                                {e.type === 'meeting' ? '📹' : '📋'} {e.title}
                            </div>
                        ))}
                        {cell.events?.length > 3 && (
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', paddingLeft: 6 }}>
                                +{cell.events.length - 3} more
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 20, marginTop: 16, padding: '12px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(59, 130, 246, 0.4)' }}></div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Meetings</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(16, 185, 129, 0.4)' }}></div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tasks</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(239, 68, 68, 0.4)' }}></div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>High Priority</span>
                </div>
            </div>
        </div>
    );
}
