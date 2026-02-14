const { getDb } = require('./server/db');
async function check() {
    const db = await getDb();
    const result = db.exec("SELECT role, COUNT(*) as count FROM users GROUP BY role");
    console.log(JSON.stringify(result, null, 2));
}
check();
