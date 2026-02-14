const { getDb, saveDb } = require('./server/db');
const bcrypt = require('bcryptjs');

async function fix() {
    const db = await getDb();
    const password = 'password123';
    const hashedPassword = bcrypt.hashSync(password, 10);
    const adminPassword = bcrypt.hashSync('admin123', 10);

    console.log('--- Cleaning up demo users ---');
    db.run("DELETE FROM users WHERE username IN ('admin', 'manager1', 'employee1')");

    console.log('--- Inserting Admin ---');
    db.run(`INSERT INTO users (name, username, email, mobile, password, role, position, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['System Admin', 'admin', 'admin@burnoutguardian.com', '9999999999', adminPassword, 'ADMIN', 'System Administrator', 'active']
    );

    console.log('--- Inserting Manager ---');
    db.run(`INSERT INTO users (name, username, email, mobile, password, role, position, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['Demo Manager', 'manager1', 'manager1@company.com', '8888888888', hashedPassword, 'MANAGER', 'Team Lead', 'active']
    );

    console.log('--- Inserting Employee ---');
    db.run(`INSERT INTO users (name, username, email, mobile, password, role, position, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['Demo Employee', 'employee1', 'employee1@company.com', '7777777777', hashedPassword, 'EMPLOYEE', 'Senior Developer', 'active']
    );

    saveDb();
    console.log('--- Verification ---');
    const check = db.exec("SELECT username, role, status FROM users WHERE username IN ('admin', 'manager1', 'employee1')");
    console.log(JSON.stringify(check, null, 2));

    console.log('✅ Fix complete. Please try employee1 / password123');
}

fix().catch(console.error);
