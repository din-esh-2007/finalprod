const express = require('express');
const { getDb, saveDb } = require('../db');

const router = express.Router();

function toObjects(result) {
    if (!result || result.length === 0 || result[0].values.length === 0) return [];
    const cols = result[0].columns;
    return result[0].values.map(row => {
        const obj = {};
        cols.forEach((c, i) => { obj[c] = row[i]; });
        return obj;
    });
}

// ── MY EMPLOYEES ──────────────────────────────────────────
router.get('/employees', async (req, res) => {
    try {
        const db = await getDb();
        const managerId = req.user.id;

        const employees = toObjects(db.exec(
            "SELECT id, name, username, email, mobile, position, status FROM users WHERE manager_id = ? AND role = 'EMPLOYEE'",
            [managerId]
        ));

        // Enrich with task and attendance data
        const enriched = employees.map(emp => {
            const today = new Date().toISOString().split('T')[0];
            const att = toObjects(db.exec(
                "SELECT total_hours FROM attendance WHERE user_id = ? AND date = ?", [emp.id, today]
            ));
            const totalTasks = toObjects(db.exec(
                "SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ?", [emp.id]
            ));
            const approved = toObjects(db.exec(
                "SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ? AND status = 'Approved'", [emp.id]
            ));
            const pending = toObjects(db.exec(
                "SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ? AND status IN ('Assigned','In Progress','Submitted')", [emp.id]
            ));

            const total = totalTasks[0]?.count || 0;
            const approvedCount = approved[0]?.count || 0;

            return {
                ...emp,
                todayHours: att[0]?.total_hours || 0,
                totalTasks: total,
                approvedTasks: approvedCount,
                pendingTasks: pending[0]?.count || 0,
                completionPercentage: total > 0 ? Math.round((approvedCount / total) * 100) : 0
            };
        });

        res.json(enriched);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── EMPLOYEE ANALYTICS ──────────────────────────────────────
router.get('/employees/:id/analytics', async (req, res) => {
    try {
        const db = await getDb();
        const empId = req.params.id;
        const { period } = req.query; // 'day', 'week', 'month'

        let daysBack = 1;
        if (period === 'week') daysBack = 7;
        if (period === 'month') daysBack = 30;

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysBack);
        const cutoffStr = cutoff.toISOString().split('T')[0];

        const attendance = toObjects(db.exec(
            "SELECT date, total_hours FROM attendance WHERE user_id = ? AND date >= ? ORDER BY date ASC",
            [empId, cutoffStr]
        ));

        const tasks = toObjects(db.exec(
            "SELECT date(created_at) as date, COUNT(*) as count FROM tasks WHERE assigned_to = ? AND status = 'Approved' AND date(created_at) >= ? GROUP BY date(created_at) ORDER BY date ASC",
            [empId, cutoffStr]
        ));

        const employee = toObjects(db.exec(
            "SELECT id, name, position, email FROM users WHERE id = ?", [empId]
        ));

        res.json({
            employee: employee[0],
            attendance,
            completedTasks: tasks
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── TASK REVIEW ──────────────────────────────────────────
router.get('/submissions', async (req, res) => {
    try {
        const db = await getDb();
        const managerId = req.user.id;

        const submissions = toObjects(db.exec(`
      SELECT ts.*, t.title, t.priority, t.deadline, u.name as employee_name
      FROM task_submissions ts
      JOIN tasks t ON ts.task_id = t.id
      JOIN users u ON ts.user_id = u.id
      WHERE t.assigned_by = ? AND t.status = 'Submitted'
      ORDER BY ts.submitted_at DESC
    `, [managerId]));

        res.json(submissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/tasks/:id/approve', async (req, res) => {
    try {
        const db = await getDb();
        const taskId = req.params.id;

        db.run("UPDATE tasks SET status = 'Approved' WHERE id = ?", [taskId]);

        const task = toObjects(db.exec("SELECT assigned_to, title FROM tasks WHERE id = ?", [taskId]));
        if (task.length > 0) {
            db.run("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
                [task[0].assigned_to, `Your task "${task[0].title}" has been approved! ✅`, 'task_approved']
            );
        }

        saveDb();
        res.json({ message: 'Task approved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/tasks/:id/reject', async (req, res) => {
    try {
        const db = await getDb();
        const taskId = req.params.id;
        const { reason } = req.body;

        db.run("UPDATE tasks SET status = 'Rejected' WHERE id = ?", [taskId]);
        db.run("UPDATE task_submissions SET rejection_reason = ? WHERE task_id = ?", [reason, taskId]);

        const task = toObjects(db.exec("SELECT assigned_to, title FROM tasks WHERE id = ?", [taskId]));
        if (task.length > 0) {
            db.run("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
                [task[0].assigned_to, `Your task "${task[0].title}" was rejected: ${reason}`, 'task_rejected']
            );
        }

        saveDb();
        res.json({ message: 'Task rejected' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── ASSIGN WORK ──────────────────────────────────────────
router.post('/assign-task', async (req, res) => {
    require('fs').appendFileSync('manager_debug.log', `[${new Date().toISOString()}] Attempting to assign task: ${req.body?.title} to ${req.body?.employee_id}\n`);
    try {
        const db = await getDb();
        const { employee_id, title, description, priority, deadline, estimated_hours } = req.body;

        console.log(`[Manager] Assigning task to ${employee_id}: ${title}`);

        db.run(`INSERT INTO tasks (assigned_to, assigned_by, title, description, priority, deadline, estimated_hours)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [Number(employee_id), req.user.id, title, description, priority, deadline, estimated_hours]
        );

        db.run("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
            [Number(employee_id), `New task assigned: "${title}"`, 'task_assigned']
        );

        saveDb();
        res.json({ message: 'Task assigned successfully' });
    } catch (err) {
        console.error('[Manager] Assign Task Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── ASSIGN MEETING ──────────────────────────────────────
router.post('/assign-meeting', async (req, res) => {
    try {
        const db = await getDb();
        const { employee_id, title, date, start_time, end_time, description } = req.body;

        console.log(`[Manager] Assigning meeting to ${employee_id}: ${title} on ${date}`);

        let duration = 0;
        try {
            const [sH, sM] = (start_time || "0:0").split(':').map(Number);
            const [eH, eM] = (end_time || "0:0").split(':').map(Number);
            duration = (eH * 60 + (eM || 0)) - (sH * 60 + (sM || 0));
        } catch (e) { }

        db.run(`INSERT INTO meetings (user_id, assigned_by, title, date, start_time, end_time, description, duration_minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [Number(employee_id), req.user.id, title || 'Meeting', date, start_time, end_time, description, duration || 0]
        );

        db.run("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
            [Number(employee_id), `New meeting scheduled: "${title || 'Meeting'}" on ${date}`, 'meeting_assigned']
        );

        saveDb();
        console.log(`[Manager] Notification sent to ${employee_id}`);
        res.json({ message: 'Meeting assigned successfully' });
    } catch (err) {
        console.error('[Manager] Assign Meeting Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── RAISE COMPLAINT ──────────────────────────────────────
router.post('/complaints', async (req, res) => {
    try {
        const db = await getDb();
        const { employee_id, category, description, severity } = req.body;

        db.run(`INSERT INTO complaints (raised_by, about_user, category, description, severity)
      VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, employee_id, category, description, severity]
        );

        saveDb();
        res.json({ message: 'Complaint raised successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── MANAGER CALENDAR ──────────────────────────────────────
router.get('/calendar', async (req, res) => {
    try {
        const db = await getDb();
        const managerId = req.user.id;

        // Tasks assigned by this manager
        const tasks = toObjects(db.exec(`
      SELECT t.id, t.title, t.deadline as date, t.priority, t.status, u.name as employee_name, 'task' as type
      FROM tasks t JOIN users u ON t.assigned_to = u.id
      WHERE t.assigned_by = ?
    `, [managerId]));

        // Meetings assigned by this manager
        const meetings = toObjects(db.exec(`
      SELECT m.id, m.title, m.date, m.start_time, m.end_time, m.description, u.name as employee_name, 'meeting' as type
      FROM meetings m JOIN users u ON m.user_id = u.id
      WHERE m.assigned_by = ?
    `, [managerId]));

        // Admin assigned tasks to this manager
        const adminTasks = toObjects(db.exec(
            "SELECT id, title, deadline as date, priority, status, 'admin_task' as type FROM admin_assigned_tasks WHERE manager_id = ?",
            [managerId]
        ));

        res.json([...tasks, ...meetings, ...adminTasks]);
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

// ── EMPLOYEE FOCUS METRICS ─────────────────────────────────
router.get('/employees/:id/focus-metrics', async (req, res) => {
    try {
        const db = await getDb();
        const empId = req.params.id;
        const managerId = req.user.id;
        const today = new Date().toISOString().split('T')[0];

        // Verify manager owns this employee
        const check = toObjects(db.exec("SELECT id FROM users WHERE id = ? AND manager_id = ?", [empId, managerId]));
        if (check.length === 0) return res.status(403).json({ error: 'Not authorized' });

        const metrics = toObjects(db.exec(
            "SELECT hour, keys_per_minute, mouse_distance_px, idle_minutes FROM focus_stats WHERE user_id = ? AND date = ? ORDER BY hour ASC",
            [empId, today]
        ));

        res.json(metrics);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── TEAM STABILITY ────────────────────────────────────────
router.get('/team-stability', async (req, res) => {
    try {
        const db = await getDb();
        const managerId = req.user.id;

        // Get all employees for this manager first
        const employees = toObjects(db.exec("SELECT id, name, burnout_phase FROM users WHERE manager_id = ?", [managerId]));

        // Get the LATEST metric for EACH of these employees
        const teamMetrics = employees.map(emp => {
            const metric = toObjects(db.exec(`
                SELECT neural_load_index, adaptive_capacity_score 
                FROM cognitive_metrics 
                WHERE user_id = ? 
                ORDER BY date DESC, hour DESC 
                LIMIT 1
            `, [emp.id]))[0];

            return {
                ...emp,
                burnout_phase: emp.burnout_phase || 1,
                neural_load_index: metric?.neural_load_index || 0,
                adaptive_capacity_score: metric?.adaptive_capacity_score || 100
            };
        });

        // Aggregate phases reliably
        const phaseDistribution = { 1: 0, 2: 0, 3: 0, 4: 0 };
        teamMetrics.forEach(m => {
            const p = m.burnout_phase || 1;
            if (phaseDistribution[p] !== undefined) phaseDistribution[p]++;
            else phaseDistribution[1]++;
        });

        res.json({
            teamMetrics,
            phaseDistribution
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── AI RETENTION RISK ────────────────────────────────────
router.get('/ai/retention-risk', async (req, res) => {
    try {
        const db = await getDb();
        const managerId = req.user.id;
        const employees = toObjects(db.exec("SELECT id, name, burnout_phase FROM users WHERE manager_id = ?", [managerId]));

        const risks = employees.map(emp => {
            const baseProb = emp.burnout_phase * 20;
            const volatility = Math.random() * 15;
            const riskScore = Math.min(95, baseProb + volatility);

            return {
                id: emp.id,
                name: emp.name,
                riskScore: Math.round(riskScore),
                status: riskScore > 75 ? 'Critical' : riskScore > 50 ? 'High' : 'Stable',
                trend: Math.random() > 0.5 ? 'increasing' : 'stable'
            };
        }).sort((a, b) => b.riskScore - a.riskScore);

        res.json(risks);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── AI TEAM SENTIMENT ────────────────────────────────────
router.get('/ai/team-sentiment', async (req, res) => {
    try {
        const sentiments = [
            { label: 'Positive', value: Math.floor(Math.random() * 40) + 30, color: '#10b981' },
            { label: 'Neutral', value: Math.floor(Math.random() * 20) + 10, color: '#6366f1' },
            { label: 'Stressed', value: Math.floor(Math.random() * 30) + 10, color: '#f59e0b' }
        ];
        res.json({
            overall: sentiments[0].value > 50 ? 'Positive' : 'Balanced',
            distribution: sentiments,
            keywords: ['Productive', 'Collaborative', 'Deadlines', 'Focus']
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── AI LOAD FORECAST ────────────────────────────────────
router.get('/ai/load-forecast', async (req, res) => {
    try {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const forecast = days.map(d => ({
            day: d,
            predictedLoad: Math.floor(Math.random() * 40) + 40,
            capacity: 100
        }));
        res.json(forecast);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
