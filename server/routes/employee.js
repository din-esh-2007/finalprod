const express = require('express');
const { getDb, saveDb } = require('../db');

const router = express.Router();

// Helper to convert query result to objects
function toObjects(result) {
    if (!result || result.length === 0 || result[0].values.length === 0) return [];
    const cols = result[0].columns;
    return result[0].values.map(row => {
        const obj = {};
        cols.forEach((c, i) => { obj[c] = row[i]; });
        return obj;
    });
}

// ── DAILY CHECK-IN ──────────────────────────────────────────
router.post('/daily-checkin', async (req, res) => {
    try {
        const db = await getDb();
        const userId = req.user.id;
        const { sleep, mood, caffeine } = req.body;
        const userName = req.user.name;

        // 1. Get user's manager
        const userRes = toObjects(db.exec("SELECT manager_id FROM users WHERE id = ?", [userId]));
        const managerId = userRes[0]?.manager_id;

        // 2. Alert Manager
        if (managerId) {
            db.run("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
                [managerId, `Check-In: ${userName} reported Mood: ${mood}/5, Sleep: ${sleep}h.`, 'insight']);
        }

        // 3. Alert Admin
        const admins = toObjects(db.exec("SELECT id FROM users WHERE role = 'ADMIN'"));
        admins.forEach(admin => {
            db.run("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
                [admin.id, `Daily Wellness: ${userName} (Emp) completed their morning sync.`, 'info']);
        });

        saveDb();
        res.json({ message: 'Daily check-in completed and supervisors notified.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── ATTENDANCE ──────────────────────────────────────────────
router.post('/attendance/checkin', async (req, res) => {
    try {
        const db = await getDb();
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toTimeString().slice(0, 5);

        const existing = db.exec("SELECT * FROM attendance WHERE user_id = ? AND date = ?", [userId, today]);
        if (existing.length > 0 && existing[0].values.length > 0) {
            return res.status(400).json({ error: 'Already checked in today' });
        }

        db.run("INSERT INTO attendance (user_id, date, check_in) VALUES (?, ?, ?)", [userId, today, now]);

        // --- ADDED: Notify Manager/Admin ---
        const userName = req.user.name;
        const userRes = toObjects(db.exec("SELECT manager_id FROM users WHERE id = ?", [userId]));
        const managerId = userRes[0]?.manager_id;
        if (managerId) {
            db.run("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
                [managerId, `Attendance: ${userName} has Checked-In at ${now}.`, 'info']);
        }
        const admins = toObjects(db.exec("SELECT id FROM users WHERE role = 'ADMIN'"));
        admins.forEach(admin => {
            db.run("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
                [admin.id, `Attendance: ${userName} (Emp) just clocked in.`, 'info']);
        });
        // -----------------------------------

        saveDb();
        res.json({ message: 'Checked in successfully', check_in: now });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/attendance/checkout', async (req, res) => {
    try {
        const db = await getDb();
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toTimeString().slice(0, 5);

        const existing = toObjects(db.exec("SELECT * FROM attendance WHERE user_id = ? AND date = ?", [userId, today]));
        if (existing.length === 0) {
            return res.status(400).json({ error: 'Not checked in today' });
        }
        if (existing[0].check_out) {
            return res.status(400).json({ error: 'Already checked out today' });
        }

        const checkIn = existing[0].check_in;
        const [cH, cM] = checkIn.split(':').map(Number);
        const [nH, nM] = now.split(':').map(Number);
        const totalHours = Math.round(((nH * 60 + nM) - (cH * 60 + cM)) / 60 * 100) / 100;
        const overtime = totalHours > 9 ? 1 : 0;

        db.run("UPDATE attendance SET check_out = ?, total_hours = ?, overtime = ? WHERE user_id = ? AND date = ?",
            [now, totalHours, overtime, userId, today]);

        // --- ADDED: Notify Manager/Admin ---
        const userName = req.user.name;
        const userRes = toObjects(db.exec("SELECT manager_id FROM users WHERE id = ?", [userId]));
        const managerId = userRes[0]?.manager_id;
        if (managerId) {
            db.run("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
                [managerId, `Attendance: ${userName} Checked-Out at ${now}. Total Hours: ${totalHours}h.`, 'info']);
        }
        const admins = toObjects(db.exec("SELECT id FROM users WHERE role = 'ADMIN'"));
        admins.forEach(admin => {
            db.run("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
                [admin.id, `Attendance: ${userName} (Emp) finished for the day.`, 'info']);
        });
        // -----------------------------------

        saveDb();
        res.json({ message: 'Checked out successfully', check_out: now, total_hours: totalHours, overtime });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/attendance', async (req, res) => {
    try {
        const db = await getDb();
        const result = toObjects(db.exec(
            "SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC LIMIT 30",
            [req.user.id]
        ));
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/attendance/today', async (req, res) => {
    try {
        const db = await getDb();
        const today = new Date().toISOString().split('T')[0];
        const result = toObjects(db.exec(
            "SELECT * FROM attendance WHERE user_id = ? AND date = ?",
            [req.user.id, today]
        ));
        res.json(result[0] || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── TASKS ──────────────────────────────────────────────────
router.get('/tasks', async (req, res) => {
    try {
        const db = await getDb();
        const tasks = toObjects(db.exec(
            "SELECT * FROM tasks WHERE assigned_to = ? ORDER BY created_at DESC",
            [req.user.id]
        ));
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/tasks/summary', async (req, res) => {
    try {
        const db = await getDb();
        const userId = req.user.id;

        const total = toObjects(db.exec("SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ?", [userId]));
        const submitted = toObjects(db.exec("SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ? AND status = 'Submitted'", [userId]));
        const approved = toObjects(db.exec("SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ? AND status = 'Approved'", [userId]));
        const rejected = toObjects(db.exec("SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ? AND status = 'Rejected'", [userId]));
        const assigned = toObjects(db.exec("SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ? AND status IN ('Assigned','In Progress')", [userId]));

        const totalCount = total[0]?.count || 0;
        const approvedCount = approved[0]?.count || 0;
        const completionPct = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

        res.json({
            total: totalCount,
            submitted: submitted[0]?.count || 0,
            approved: approvedCount,
            rejected: rejected[0]?.count || 0,
            pending: assigned[0]?.count || 0,
            completionPercentage: completionPct
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/tasks/:id/submit', async (req, res) => {
    try {
        const db = await getDb();
        const taskId = req.params.id;
        const { completion_status, work_summary, hours_spent } = req.body;

        db.run("UPDATE tasks SET status = 'Submitted' WHERE id = ? AND assigned_to = ?", [taskId, req.user.id]);
        db.run(`INSERT INTO task_submissions (task_id, user_id, completion_status, work_summary, hours_spent)
      VALUES (?, ?, ?, ?, ?)`,
            [taskId, req.user.id, completion_status, work_summary, hours_spent]
        );
        saveDb();
        res.json({ message: 'Task submitted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── MEETINGS ──────────────────────────────────────────────
router.get('/meetings', async (req, res) => {
    try {
        const db = await getDb();
        const meetings = toObjects(db.exec(
            "SELECT * FROM meetings WHERE user_id = ? ORDER BY date DESC, start_time ASC",
            [req.user.id]
        ));
        res.json(meetings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/meetings/today', async (req, res) => {
    try {
        const db = await getDb();
        const today = new Date().toISOString().split('T')[0];
        const meetings = toObjects(db.exec(
            "SELECT * FROM meetings WHERE user_id = ? AND date = ? ORDER BY start_time ASC",
            [req.user.id, today]
        ));
        const totalMinutes = meetings.reduce((sum, m) => sum + (m.duration_minutes || 0), 0);
        res.json({ meetings, totalMinutes, meetingHeavy: meetings.length > 4 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── NOTIFICATIONS ──────────────────────────────────────────
router.get('/notifications', async (req, res) => {
    try {
        const db = await getDb();
        const notifs = toObjects(db.exec(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
            [req.user.id]
        ));
        const unread = toObjects(db.exec(
            "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
            [req.user.id]
        ));
        res.json({ notifications: notifs, unreadCount: unread[0]?.count || 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/notifications/read', async (req, res) => {
    try {
        const db = await getDb();
        db.run("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [req.user.id]);
        saveDb();
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── SMART SUGGESTIONS ──────────────────────────────────────
router.get('/suggestions', async (req, res) => {
    try {
        const db = await getDb();
        const userId = req.user.id;
        const suggestions = [];
        const today = new Date().toISOString().split('T')[0];

        // Check overtime
        const attendance = toObjects(db.exec(
            "SELECT * FROM attendance WHERE user_id = ? AND date = ?", [userId, today]
        ));
        if (attendance.length > 0 && attendance[0].total_hours > 9) {
            suggestions.push({ type: 'warning', icon: '⚠️', message: 'You have been working overtime today. Take a break!' });
        }

        // Check pending tasks
        const pending = toObjects(db.exec(
            "SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ? AND status IN ('Assigned','In Progress')", [userId]
        ));
        if (pending[0]?.count > 5) {
            suggestions.push({ type: 'info', icon: '📋', message: `You have ${pending[0].count} pending tasks. Prioritize the high-priority ones.` });
        }

        // Check rejections
        const rejected = toObjects(db.exec(
            "SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ? AND status = 'Rejected'", [userId]
        ));
        if (rejected[0]?.count > 0) {
            suggestions.push({ type: 'alert', icon: '🔄', message: `${rejected[0].count} task(s) were rejected. Review feedback and resubmit.` });
        }

        // Check meeting overload
        const meetings = toObjects(db.exec(
            "SELECT COUNT(*) as count FROM meetings WHERE user_id = ? AND date = ?", [userId, today]
        ));
        if (meetings[0]?.count > 4) {
            suggestions.push({ type: 'warning', icon: '📅', message: 'Meeting-heavy day! Block focus time for deep work.' });
        }

        if (suggestions.length === 0) {
            suggestions.push({ type: 'success', icon: '✅', message: 'Great job! You\'re on track today. Keep it up!' });
        }

        res.json(suggestions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── CALENDAR ──────────────────────────────────────────────
router.get('/calendar', async (req, res) => {
    try {
        const db = await getDb();
        const userId = req.user.id;

        const tasks = toObjects(db.exec(
            "SELECT id, title, deadline as date, priority, status, 'task' as type FROM tasks WHERE assigned_to = ?",
            [userId]
        ));
        const meetings = toObjects(db.exec(
            "SELECT id, title, date, start_time, end_time, description, 'meeting' as type FROM meetings WHERE user_id = ?",
            [userId]
        ));

        res.json([...tasks, ...meetings]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── FOCUS METRICS ──────────────────────────────────────────
router.get('/focus-metrics', async (req, res) => {
    try {
        const db = await getDb();
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];

        const metrics = toObjects(db.exec(
            "SELECT hour, keys_per_minute, mouse_distance_px, idle_minutes FROM focus_stats WHERE user_id = ? AND date = ? ORDER BY hour ASC",
            [userId, today]
        ));

        res.json(metrics);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── COGNITIVE PROFILE ─────────────────────────────────────
router.get('/cognitive-profile', async (req, res) => {
    try {
        const db = await getDb();
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];

        const latest = toObjects(db.exec(
            "SELECT * FROM cognitive_metrics WHERE user_id = ? ORDER BY date DESC, hour DESC LIMIT 1",
            [userId]
        ))[0];

        const history = toObjects(db.exec(
            "SELECT date, fragmentation_index, latent_stress_index, neural_load_index FROM cognitive_metrics WHERE user_id = ? AND date <= ? ORDER BY date ASC, hour ASC LIMIT 24",
            [userId, today]
        ));

        // Get phase description from static helper logic
        const phase = latest?.burnout_phase || 1;
        const descriptions = {
            1: { name: 'Silent Accumulation', color: '#10b981', desc: 'Stability is good, but micro-stress is gathering.' },
            2: { name: 'Functional Overdrive', color: '#6366f1', desc: 'High performance maintained via high effort.' },
            3: { name: 'Volatility Escalation', color: '#f59e0b', desc: 'Frequent stability spikes; recovery slowing down.' },
            4: { name: 'Collapse Risk', color: '#ef4444', desc: 'Critical neural load; high probability of performance drop.' }
        };

        res.json({
            current: latest,
            history,
            phase: descriptions[phase]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── AI FOCUS FORECAST ────────────────────────────────────
router.get('/ai/focus-forecast', async (req, res) => {
    try {
        const hours = ['09:00', '11:00', '13:00', '15:00', '17:00'];
        const forecast = hours.map(h => ({
            hour: h,
            focusScore: Math.floor(Math.random() * 30) + (h === '11:00' || h === '15:00' ? 60 : 40),
            optimized: h === '11:00' || h === '15:00'
        }));
        res.json(forecast);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── AI NEURO RECOVERY ────────────────────────────────────
router.get('/ai/neuro-recovery', async (req, res) => {
    try {
        res.json({
            recoveryRate: Math.floor(Math.random() * 20) + 70,
            status: 'Optimal',
            lastReset: '2 hours ago',
            nextPeak: 'In 45 minutes'
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── AI HABITS ────────────────────────────────────────────
router.get('/ai/habits', async (req, res) => {
    try {
        const habits = [
            { name: 'Micro-Breaks', completion: 85, impact: 'High' },
            { name: 'Deep Work Segments', completion: 60, impact: 'Medium' },
            { name: 'Neural Reset', completion: 40, impact: 'Critical' }
        ];
        res.json(habits);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
