const { getDb } = require('./server/db');
const bcrypt = require('bcryptjs');

async function check() {
    const db = await getDb();
    const result = db.exec("SELECT username, password, role, status FROM users WHERE role = 'EMPLOYEE' LIMIT 5");

    if (result.length === 0 || result[0].values.length === 0) {
        console.log("No employees found!");
        return;
    }

    const cols = result[0].columns;
    result[0].values.forEach(row => {
        const u = {};
        cols.forEach((c, i) => u[c] = row[i]);
        console.log(`User: ${u.username}, Status: ${u.status}, Role: ${u.role}`);
        const match = bcrypt.compareSync('password123', u.password);
        console.log(`  Password 'password123' match: ${match}`);
    });
}

check();
