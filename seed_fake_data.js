const { getDb, saveDb } = require('./server/db');

async function seedFakeData() {
    console.log('🌱 Seeding fake task entries...');
    const db = await getDb();

    // 1. Get employee1 and manager1 IDs
    const users = db.exec("SELECT id, role, username FROM users WHERE username IN ('employee1', 'manager1')");
    const userMap = {};
    if (users[0] && users[0].values) {
        users[0].values.forEach(row => {
            userMap[row[2]] = row[0];
        });
    }

    const emp1Id = userMap['employee1'];
    const mgr1Id = userMap['manager1'];

    if (!emp1Id || !mgr1Id) {
        console.error('❌ Could not find employee1 or manager1. Please run seed.js or fix_auth.js first.');
        return;
    }

    // Clear existing tasks for employee1 to avoid duplicates if re-run
    db.run("DELETE FROM tasks WHERE assigned_to = ?", [emp1Id]);
    db.run("DELETE FROM task_submissions WHERE user_id = ?", [emp1Id]);

    // 2. Add fake tasks for employee1
    const fakeTasks = [
        { title: 'Neural Network Optimization', description: 'Refactor the core tensor processing units.', priority: 'High', deadline: '2026-02-20', hours: 12, status: 'In Progress' },
        { title: 'Privacy Protocol Audit', description: 'Review the new encryption standards for data at rest.', priority: 'Critical', deadline: '2026-02-15', hours: 8, status: 'Assigned' },
        { title: 'Dashboard UI Refinement', description: 'Apply the latest glassmorphism styles to the risk radar.', priority: 'Medium', deadline: '2026-02-18', hours: 6, status: 'Submitted' },
        { title: 'API Documentation', description: 'Complete the Swagger docs for the cognitive services.', priority: 'Low', deadline: '2026-02-22', hours: 4, status: 'Approved' },
        { title: 'Unit Test Coverage', description: 'Increase test coverage for the Auth module.', priority: 'Medium', deadline: '2026-02-14', hours: 5, status: 'Rejected' }
    ];

    fakeTasks.forEach(t => {
        db.run(`INSERT INTO tasks (assigned_to, assigned_by, title, description, priority, deadline, estimated_hours, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [emp1Id, mgr1Id, t.title, t.description, t.priority, t.deadline, t.hours, t.status]);
    });

    // 3. Add fake submissions for the manager to review
    const submittedTasks = db.exec("SELECT id, status FROM tasks WHERE assigned_to = ? AND status IN ('Submitted', 'Rejected')", [emp1Id]);
    if (submittedTasks[0] && submittedTasks[0].values) {
        submittedTasks[0].values.forEach((row, idx) => {
            const taskId = row[0];
            const status = row[1];
            db.run(`INSERT INTO task_submissions (task_id, user_id, completion_status, work_summary, hours_spent) 
                    VALUES (?, ?, ?, ?, ?)`,
                [taskId, emp1Id, idx % 2 === 0 ? 'Completed' : 'Partial', `This work for task #${taskId} was completed with focus and high efficiency.`, 5 + idx]);

            if (status === 'Rejected') {
                db.run("UPDATE task_submissions SET rejection_reason = ? WHERE task_id = ?", ["Please clarify the unit test coverage metrics. It seems some edge cases are missing.", taskId]);
            }
        });
    }

    // 4. Add fake attendance entries for history (for the graph)
    db.run("DELETE FROM attendance WHERE user_id = ?", [emp1Id]);
    const dates = ['2026-02-01', '2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05', '2026-02-06', '2026-02-07', '2026-02-08', '2026-02-09', '2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13'];
    dates.forEach(d => {
        const hours = (Math.random() * 4 + 6).toFixed(1);
        db.run("INSERT INTO attendance (user_id, date, check_in, check_out, total_hours) VALUES (?, ?, '09:00', ?, ?)",
            [emp1Id, d, (15 + Math.floor(hours)) + ':30', hours]);
    });

    // 5. Add fake notifications
    db.run("INSERT INTO notifications (user_id, message, type) VALUES (?, 'You have a new task assigned: Privacy Protocol Audit', 'info')", [emp1Id]);
    db.run("INSERT INTO notifications (user_id, message, type) VALUES (?, 'Manager approved your work on: API Documentation', 'success')", [emp1Id]);

    // 6. Notify Manager about submissions
    db.run("INSERT INTO notifications (user_id, message, type) VALUES (?, 'New Task Submission: Dashboard UI Refinement from employee1', 'insight')", [mgr1Id]);

    // 7. Add Admin Tasks for Manager
    const adminId = 1; // System Admin usually has ID 1
    const adminTasks = [
        { title: 'Quarterly Team Focus Review', deadline: '2026-03-01', priority: 'High' },
        { title: 'Mandatory Mental Health Audit', deadline: '2026-02-28', priority: 'Critical' }
    ];
    adminTasks.forEach(t => {
        db.run(`INSERT INTO admin_assigned_tasks (manager_id, assigned_by, title, deadline, priority, status) 
                VALUES (?, ?, ?, ?, ?, 'Assigned')`,
            [mgr1Id, adminId, t.title, t.deadline, t.priority]);
    });

    // 8. Add Cognitive Metrics for ALL employees to ensure graphs show up
    const allEmps = toObjects(db.exec("SELECT id FROM users WHERE role = 'EMPLOYEE'"));
    allEmps.forEach(emp => {
        const userId = emp.id;
        // Add 14 days of history
        for (let i = 0; i < 14; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            for (let hour = 9; hour < 18; hour += 3) {
                const frag = Math.floor(Math.random() * 40) + 10;
                const stress = Math.floor(Math.random() * 50) + 20;
                const load = Math.floor(Math.random() * 60) + 30;
                const phase = i < 3 ? (Math.random() > 0.8 ? 2 : 1) : 1;

                db.run(`INSERT INTO cognitive_metrics (user_id, date, hour, fragmentation_index, latent_stress_index, neural_load_index, burnout_phase)
                        VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [userId, dateStr, hour, frag, stress, load, phase]);
            }
        }

        // Randomly set some to higher phases for variety
        if (Math.random() > 0.7) {
            const highPhase = Math.floor(Math.random() * 3) + 2;
            db.run("UPDATE users SET burnout_phase = ? WHERE id = ?", [highPhase, userId]);
        }
    });

    saveDb();
    console.log('✅ Fake data and cognitive metrics seeded successfully!');
}

function toObjects(result) {
    if (!result || result.length === 0 || result[0].values.length === 0) return [];
    const cols = result[0].columns;
    return result[0].values.map(row => {
        const obj = {};
        cols.forEach((c, i) => { obj[c] = row[i]; });
        return obj;
    });
}

seedFakeData().catch(console.error);
