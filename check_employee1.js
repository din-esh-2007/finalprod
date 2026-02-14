const { getDb } = require('./server/db');
async function check() {
    const db = await getDb();
    const result = db.exec("SELECT * FROM users WHERE username = 'employee1'");
    console.log(JSON.stringify(result, null, 2));
}
check();
