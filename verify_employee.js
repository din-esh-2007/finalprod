const { getDb } = require('./server/db');
const bcrypt = require('bcryptjs');

async function verify() {
    console.log('--- Verification Script ---');
    const db = await getDb();
    const username = 'employee1';
    const password = 'password123';

    const result = db.exec("SELECT username, password, role FROM users WHERE username = ?", [username]);

    if (result.length === 0 || result[0].values.length === 0) {
        console.log(`FAIL: User '${username}' not found in database.`);
        return;
    }

    const dbUser = result[0].values[0];
    const dbUsername = dbUser[0];
    const dbHashedPassword = dbUser[1];
    const dbRole = dbUser[2];

    console.log(`SUCCESS: Found user '${dbUsername}' with role '${dbRole}'.`);

    const isMatch = bcrypt.compareSync(password, dbHashedPassword);
    if (isMatch) {
        console.log(`SUCCESS: Password '${password}' matches the hash in DB.`);
    } else {
        console.log(`FAIL: Password '${password}' DOES NOT match the hash in DB.`);
    }
}

verify().catch(console.error);
