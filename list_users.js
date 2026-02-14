const { getDb } = require('./server/db');
async function check() {
    const db = await getDb();
    const result = db.exec("SELECT username FROM users WHERE role = 'EMPLOYEE' LIMIT 20");
    console.log(JSON.stringify(result, null, 2));
}
check();
