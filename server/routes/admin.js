const express = require('express');
const bcrypt = require('bcryptjs');
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

// ── CREATE USER ──────────────────────────────────────────
router.post('/users', async (req, res) => {
    try {
        const db = await getDb();
        const { name, username, email, mobile, password, role, position, manager_id } = req.body;

        if (!name || !username || !password || !role) {
            return res.status(400).json({ error: 'Name, username, password and role are required' });
        }

        const existing = toObjects(db.exec("SELECT id FROM users WHERE username = ?", [username]));
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        db.run(`INSERT INTO users (name, username, email, mobile, password, role, position, manager_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, username, email, mobile, hashedPassword, role, position, manager_id || null]
        );

        saveDb();
        res.json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET ALL WORKERS ──────────────────────────────────────
router.get('/users', async (req, res) => {
    try {
        const db = await getDb();
        const users = toObjects(db.exec(
            "SELECT id, name, username, email, mobile, role, position, status, manager_id, created_at FROM users WHERE id != ? ORDER BY role, name",
            [req.user.id]
        ));
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET MANAGERS LIST ──────────────────────────────────────
router.get('/managers', async (req, res) => {
    try {
        const db = await getDb();
        const managers = toObjects(db.exec(
            "SELECT id, name, username, position FROM users WHERE role = 'MANAGER' AND status = 'active'"
        ));
        res.json(managers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── WORKER REPORT ──────────────────────────────────────────
router.get('/users/:id/report', async (req, res) => {
    try {
        const db = await getDb();
        const userId = req.params.id;
        const { period } = req.query;

        let daysBack = 7;
        if (period === 'monthly') daysBack = 30;

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysBack);
        const cutoffStr = cutoff.toISOString().split('T')[0];

        const user = toObjects(db.exec(
            "SELECT id, name, username, role, position, email, status FROM users WHERE id = ?", [userId]
        ));

        const attendance = toObjects(db.exec(
            "SELECT date, total_hours FROM attendance WHERE user_id = ? AND date >= ? ORDER BY date ASC",
            [userId, cutoffStr]
        ));

        const tasks = toObjects(db.exec(
            "SELECT date(created_at) as date, COUNT(*) as count FROM tasks WHERE assigned_to = ? AND status = 'Approved' AND date(created_at) >= ? GROUP BY date(created_at) ORDER BY date ASC",
            [userId, cutoffStr]
        ));

        const totalHours = attendance.reduce((sum, a) => sum + (a.total_hours || 0), 0);
        const totalCompleted = tasks.reduce((sum, t) => sum + t.count, 0);

        res.json({
            user: user[0],
            attendance,
            completedTasks: tasks,
            summary: {
                totalHours: Math.round(totalHours * 100) / 100,
                totalCompleted,
                avgHoursPerDay: attendance.length > 0 ? Math.round((totalHours / attendance.length) * 100) / 100 : 0
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── EDIT USER ──────────────────────────────────────────
router.put('/users/:id', async (req, res) => {
    try {
        const db = await getDb();
        const userId = req.params.id;
        const { name, email, mobile, position, password } = req.body;

        if (name) db.run("UPDATE users SET name = ? WHERE id = ?", [name, userId]);
        if (email) db.run("UPDATE users SET email = ? WHERE id = ?", [email, userId]);
        if (mobile) db.run("UPDATE users SET mobile = ? WHERE id = ?", [mobile, userId]);
        if (position) db.run("UPDATE users SET position = ? WHERE id = ?", [position, userId]);
        if (password) {
            const hashed = bcrypt.hashSync(password, 10);
            db.run("UPDATE users SET password = ? WHERE id = ?", [hashed, userId]);
        }

        saveDb();
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── DELETE USER ──────────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
    try {
        const db = await getDb();
        const userId = req.params.id;

        db.run("DELETE FROM notifications WHERE user_id = ?", [userId]);
        db.run("DELETE FROM task_submissions WHERE user_id = ?", [userId]);
        db.run("DELETE FROM tasks WHERE assigned_to = ?", [userId]);
        db.run("DELETE FROM meetings WHERE user_id = ?", [userId]);
        db.run("DELETE FROM attendance WHERE user_id = ?", [userId]);
        db.run("DELETE FROM complaints WHERE about_user = ?", [userId]);
        db.run("DELETE FROM users WHERE id = ?", [userId]);

        saveDb();
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── SUSPEND / ACTIVATE USER ──────────────────────────────
router.put('/users/:id/suspend', async (req, res) => {
    try {
        const db = await getDb();
        const userId = req.params.id;

        const user = toObjects(db.exec("SELECT status FROM users WHERE id = ?", [userId]));
        const newStatus = user[0]?.status === 'active' ? 'suspended' : 'active';

        db.run("UPDATE users SET status = ? WHERE id = ?", [newStatus, userId]);
        saveDb();
        res.json({ message: `User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`, status: newStatus });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── ASSIGN WORK TO MANAGER ──────────────────────────────
router.post('/assign-to-manager', async (req, res) => {
    try {
        const db = await getDb();
        const { manager_id, title, description, priority, deadline, estimated_hours } = req.body;

        db.run(`INSERT INTO admin_assigned_tasks (manager_id, assigned_by, title, description, priority, deadline, estimated_hours)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [manager_id, req.user.id, title, description, priority, deadline, estimated_hours]
        );

        db.run("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
            [manager_id, `Admin assigned new work: "${title}"`, 'task_assigned']
        );

        saveDb();
        res.json({ message: 'Work assigned to manager successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET COMPLAINTS ──────────────────────────────────────
router.get('/complaints', async (req, res) => {
    try {
        const db = await getDb();
        const complaints = toObjects(db.exec(`
      SELECT c.*, 
        u1.name as raised_by_name, 
        u2.name as about_user_name
      FROM complaints c
      JOIN users u1 ON c.raised_by = u1.id
      JOIN users u2 ON c.about_user = u2.id
      ORDER BY c.created_at DESC
    `));
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── DASHBOARD STATS ──────────────────────────────────────
router.get('/stats', async (req, res) => {
    try {
        const db = await getDb();

        const totalEmployees = toObjects(db.exec("SELECT COUNT(*) as count FROM users WHERE role = 'EMPLOYEE'"));
        const totalManagers = toObjects(db.exec("SELECT COUNT(*) as count FROM users WHERE role = 'MANAGER'"));
        const activeUsers = toObjects(db.exec("SELECT COUNT(*) as count FROM users WHERE status = 'active' AND role != 'ADMIN'"));
        const suspendedUsers = toObjects(db.exec("SELECT COUNT(*) as count FROM users WHERE status = 'suspended'"));
        const totalTasks = toObjects(db.exec("SELECT COUNT(*) as count FROM tasks"));
        const completedTasks = toObjects(db.exec("SELECT COUNT(*) as count FROM tasks WHERE status = 'Approved'"));
        const pendingTasks = toObjects(db.exec("SELECT COUNT(*) as count FROM tasks WHERE status IN ('Assigned','In Progress','Submitted')"));
        const totalComplaints = toObjects(db.exec("SELECT COUNT(*) as count FROM complaints"));
        const openComplaints = toObjects(db.exec("SELECT COUNT(*) as count FROM complaints WHERE status = 'Open'"));

        res.json({
            totalEmployees: totalEmployees[0]?.count || 0,
            totalManagers: totalManagers[0]?.count || 0,
            activeUsers: activeUsers[0]?.count || 0,
            suspendedUsers: suspendedUsers[0]?.count || 0,
            totalTasks: totalTasks[0]?.count || 0,
            completedTasks: completedTasks[0]?.count || 0,
            pendingTasks: pendingTasks[0]?.count || 0,
            totalComplaints: totalComplaints[0]?.count || 0,
            openComplaints: openComplaints[0]?.count || 0
        });
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

// ── ORG INTELLIGENCE ──────────────────────────────────────
router.get('/org-intelligence', async (req, res) => {
    try {
        const db = await getDb();

        const stats = toObjects(db.exec(`
            SELECT burnout_phase, COUNT(*) as count 
            FROM users 
            WHERE role = 'EMPLOYEE' 
            GROUP BY burnout_phase
        `));

        const neuralTraffic = toObjects(db.exec(`
            SELECT date, AVG(neural_load_index) as avg_load 
            FROM cognitive_metrics 
            GROUP BY date 
            ORDER BY date DESC 
            LIMIT 14
        `));

        res.json({
            phaseDistribution: stats,
            neuralTraffic: neuralTraffic.reverse()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── AI ECONOMIC IMPACT ───────────────────────────────────
router.get('/ai/economic-impact', async (req, res) => {
    try {
        res.json({
            lossAverted: 45000,
            burnoutCost: 12000,
            productivityGain: 18,
            roi: 3.5
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── AI STRATEGIC PLANNING ─────────────────────────────────
router.get('/ai/strategic-planning', async (req, res) => {
    try {
        const departments = ['Engineering', 'Design', 'Marketing', 'Support'];
        const planning = departments.map(d => ({
            dept: d,
            health: Math.floor(Math.random() * 30) + 60,
            recommendedHires: Math.floor(Math.random() * 3)
        }));
        res.json(planning);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── AI GLOBAL STABILITY ──────────────────────────────────
router.get('/ai/global-stability', async (req, res) => {
    try {
        const regions = [
            { name: 'North America', stability: 88, alert: false },
            { name: 'Europe', stability: 72, alert: true },
            { name: 'Asia Pacific', stability: 91, alert: false }
        ];
        res.json(regions);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
