const { getDb, saveDb } = require('./db');
const bcrypt = require('bcryptjs');

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
    'Ananya', 'Diya', 'Priya', 'Riya', 'Saanvi', 'Aanya', 'Kavya', 'Isha', 'Meera', 'Nisha',
    'Rahul', 'Rohan', 'Amit', 'Suresh', 'Vikram', 'Deepak', 'Kiran', 'Manoj', 'Nikhil', 'Pooja',
    'Sneha', 'Swati', 'Tanvi', 'Uma', 'Varun', 'Gaurav', 'Harish', 'Jatin', 'Kunal', 'Lavanya',
    'Madhav', 'Neeraj', 'Om', 'Pranav', 'Rajesh', 'Sakshi', 'Tarun', 'Uday', 'Vinay', 'Yash'];

const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Reddy', 'Gupta', 'Joshi', 'Nair', 'Menon', 'Rao',
    'Verma', 'Iyer', 'Pillai', 'Das', 'Bose', 'Sen', 'Chatterjee', 'Banerjee', 'Mukherjee', 'Ghosh',
    'Agarwal', 'Malhotra', 'Kapoor', 'Mehta', 'Shah', 'Thakur', 'Mishra', 'Sinha', 'Saxena', 'Tiwari'];

const positions = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer',
    'QA Tester', 'DevOps Engineer', 'Data Analyst', 'Mobile Developer', 'Support Engineer', 'Intern'
];

const taskTitles = [
    'Implement user authentication module', 'Fix responsive layout bugs', 'Design new dashboard wireframes',
    'Write unit tests for API endpoints', 'Set up CI/CD pipeline', 'Analyze Q4 performance data',
    'Build mobile notification system', 'Resolve customer support tickets', 'Create onboarding documentation',
    'Optimize database queries', 'Review pull requests', 'Update API documentation',
    'Implement search functionality', 'Fix memory leak in backend', 'Design email templates',
    'Set up monitoring alerts', 'Migrate legacy codebase', 'Build data visualization charts',
    'Implement caching layer', 'Create automated test suite', 'Refactor payment module',
    'Build user profile page', 'Implement file upload feature', 'Design landing page',
    'Set up load testing', 'Fix cross-browser compatibility', 'Implement dark mode',
    'Build admin panel features', 'Create REST API endpoints', 'Implement WebSocket chat'
];

const meetingTitles = [
    'Sprint Planning', 'Daily Standup', 'Code Review Session', 'Architecture Discussion',
    'Client Demo', 'Team Retrospective', '1:1 with Manager', 'Design Review',
    'Product Roadmap Discussion', 'Bug Triage Meeting', 'Knowledge Sharing Session',
    'Quarterly Review', 'Project Kickoff', 'Status Update', 'Training Session'
];

const complaintCategories = ['Performance', 'Behavior', 'Attendance', 'Communication', 'Work Quality', 'Policy Violation'];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysBack) {
    const d = new Date();
    d.setDate(d.getDate() - randomInt(0, daysBack));
    return d.toISOString().split('T')[0];
}

function randomTime(startHour, endHour) {
    const h = randomInt(startHour, endHour);
    const m = randomInt(0, 3) * 15;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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

async function seed() {
    const db = await getDb();

    // Check if initial users exist
    const usersExist = db.exec("SELECT COUNT(*) as count FROM users")[0].values[0][0] > 0;
    const hashedPassword = bcrypt.hashSync('password123', 10);
    const adminPassword = bcrypt.hashSync('admin123', 10);

    if (!usersExist) {
        console.log('🚀 Starting fresh database seed...');

        // 1. Create Admin
        db.run(`INSERT INTO users (name, username, email, mobile, password, role, position, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            ['System Admin', 'admin', 'admin@burnoutguardian.com', '9999999999', adminPassword, 'ADMIN', 'System Administrator', 'active']
        );

        // 2. Create Managers
        const managers = [];
        for (let i = 1; i <= 30; i++) {
            const name = `${firstNames[randomInt(0, 49)]} ${lastNames[randomInt(0, 29)]}`;
            const username = `manager${i}`;
            db.run(`INSERT INTO users (name, username, email, mobile, password, role, position)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [name, username, `${username}@company.com`, '8888888888', hashedPassword, 'MANAGER', 'Team Lead']
            );
            const res = toObjects(db.exec("SELECT id FROM users WHERE username = ?", [username]));
            managers.push(res[0].id);
        }

        // 3. Create Employees
        for (let i = 1; i <= 100; i++) {
            const name = `${firstNames[randomInt(0, 49)]} ${lastNames[randomInt(0, 29)]}`;
            const username = `employee${i}`;
            const managerId = managers[randomInt(0, 29)];
            db.run(`INSERT INTO users (name, username, email, mobile, password, role, position, manager_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, username, `${username}@company.com`, '7777777777', hashedPassword, 'EMPLOYEE', positions[randomInt(0, 9)], managerId]
            );
        }
    }

    // 4. Always ensure core demo users exist for training/support
    console.log('🔐 Synchronizing core demo credentials...');
    const coreUsers = [
        { name: 'System Admin', username: 'admin', password: adminPassword, role: 'ADMIN', position: 'System Administrator' },
        { name: 'Demo Manager', username: 'manager1', password: hashedPassword, role: 'MANAGER', position: 'Team Lead' },
        { name: 'Demo Employee', username: 'employee1', password: hashedPassword, role: 'EMPLOYEE', position: 'Senior Developer' }
    ];

    coreUsers.forEach(u => {
        db.run("DELETE FROM users WHERE username = ?", [u.username]);
        db.run(`INSERT INTO users (name, username, email, mobile, password, role, position, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [u.name, u.username, `${u.username}@company.com`, '9988776655', u.password, u.role, u.position, 'active']
        );
    });

    // Always ensure Om Pillai exists for testing and is assigned to manager ID (lookup manager1 id)
    const m1Res = toObjects(db.exec("SELECT id FROM users WHERE username = 'manager1'"));
    const m1Id = m1Res[0]?.id || 2;

    db.run("DELETE FROM users WHERE name = 'Om Pillai'");
    console.log(`👤 Adding Om Pillai to Manager ID ${m1Id}...`);
    db.run(`INSERT INTO users (name, username, email, mobile, password, role, position, manager_id, burnout_phase)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['Om Pillai', 'ompillai', 'om@company.com', '9876543210', hashedPassword, 'EMPLOYEE', 'Senior Developer', m1Id, 4]
    );

    // Also add a few more high risk people
    const otherHighRisk = ['Ananya Sharma', 'Rahul Patel'];
    otherHighRisk.forEach(name => {
        db.run("DELETE FROM users WHERE name = ?", [name]);
        db.run(`INSERT INTO users (name, username, email, mobile, password, role, position, manager_id, burnout_phase)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, name.toLowerCase().replace(' ', ''), `${name.toLowerCase()}@company.com`, '9988776655', hashedPassword, 'EMPLOYEE', 'Developer', m1Id, 3]
        );
    });

    // Always re-generate metrics to ensure diversity and fill data
    console.log('📉 Refreshing Cognitive & Focus Metrics...');
    const employees = toObjects(db.exec("SELECT id, name FROM users WHERE role = 'EMPLOYEE'"));

    employees.forEach(emp => {
        db.run("DELETE FROM cognitive_metrics WHERE user_id = ?", [emp.id]);
        db.run("DELETE FROM focus_stats WHERE user_id = ?", [emp.id]);

        for (let d = 0; d < 14; d++) {
            const date = new Date();
            date.setDate(date.getDate() - d);
            const dateStr = date.toISOString().split('T')[0];

            for (let h = 9; h <= 18; h++) {
                const isOm = emp.name === 'Om Pillai';
                const kpm = isOm ? randomInt(90, 160) : randomInt(20, 120);
                const mouse = randomInt(500, 3000);
                const idle = isOm ? randomInt(0, 5) : randomInt(0, 15);

                db.run(`INSERT INTO focus_stats (user_id, date, hour, keys_per_minute, mouse_distance_px, idle_minutes)
                VALUES (?, ?, ?, ?, ?, ?)`,
                    [emp.id, dateStr, h, kpm, mouse, idle]
                );

                const frag = isOm ? randomInt(60, 95) : randomInt(10, 60);
                const stress = (isOm ? randomInt(70, 98) : randomInt(5, 50)) + (d > 7 ? 10 : 0);
                const capacity = 100 - (stress * 0.6) - (frag * 0.4);
                const load = (kpm / 2) + (frag * 0.5);

                let phase = 1;
                if (load > 60 && capacity < 35) phase = 4;
                else if (load > 45 && capacity < 55) phase = 3;
                else if (load > 30) phase = 2;

                // Ensure some diversity
                if (!isOm && randomInt(1, 20) === 1) phase = 4;
                if (!isOm && randomInt(1, 10) === 1) phase = 3;

                db.run(`INSERT INTO cognitive_metrics (user_id, date, hour, fragmentation_index, latent_stress_index, adaptive_capacity_score, neural_load_index, burnout_phase)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [emp.id, dateStr, h, frag, stress, capacity, load, phase]
                );

                if (d === 0 && h === 18) {
                    db.run("UPDATE users SET burnout_phase = ? WHERE id = ?", [phase, emp.id]);
                }
            }
        }
    });

    // Add notifications for manager1
    const m1 = toObjects(db.exec("SELECT id FROM users WHERE username = 'manager1'"))[0];
    if (m1) {
        db.run("DELETE FROM notifications WHERE user_id = ?", [m1.id]);
        db.run("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)", [m1.id, "CRITICAL: Om Pillai's Neural Load is at 94%. Phase 4 detected.", "alert"]);
        db.run("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)", [m1.id, "Stability Alert: 3 other employees are entering high-risk clusters.", "alert"]);
        db.run("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)", [m1.id, "Optimization: Redistribute Om's tasks to 2 available Phase 1 colleagues.", "suggestion"]);
    }

    saveDb();
    console.log('✅ Database refresh complete!');
    console.log('👤 Test User: Om Pillai (Phase 4)');
    console.log('🔑 Login: manager1 / password123');
}

seed().catch(e => {
    console.error('❌ Seeding failed:', e);
});
