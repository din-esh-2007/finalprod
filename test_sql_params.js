const { getDb } = require('./server/db');

async function testQuery() {
    const db = await getDb();
    const username = 'employee1';

    console.log('--- Testing with parameters (standard sql.js doesnt support this in exec) ---');
    try {
        const result = db.exec("SELECT username FROM users WHERE username = ?", [username]);
        console.log('Result with parameters:', JSON.stringify(result));
    } catch (e) {
        console.log('Error with parameters:', e.message);
    }

    console.log('--- Testing with template literal (concatenation) ---');
    try {
        const result = db.exec(`SELECT username FROM users WHERE username = '${username}'`);
        console.log('Result with concat:', JSON.stringify(result));
    } catch (e) {
        console.log('Error with concat:', e.message);
    }
}

testQuery().catch(console.error);
