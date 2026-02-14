const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb } = require('./db');
const { authMiddleware, roleMiddleware } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const managerRoutes = require('./routes/manager');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employee', authMiddleware, roleMiddleware('EMPLOYEE'), employeeRoutes);
app.use('/api/manager', authMiddleware, roleMiddleware('MANAGER'), managerRoutes);
app.use('/api/admin', authMiddleware, roleMiddleware('ADMIN'), adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize DB and start server
async function start() {
    await getDb();
    console.log('📦 Database initialized');

    // Auto-seed if needed
    try {
        const { getDb: getDatabase } = require('./db');
        const db = await getDatabase();
        const result = db.exec("SELECT COUNT(*) as count FROM users");
        if (result.length === 0 || result[0].values[0][0] === 0) {
            console.log('🌱 Seeding database...');
            require('./seed');
        }
    } catch (e) {
        console.log('🌱 Running seed...');
        require('./seed');
    }

    app.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 Burnout & Focus Guardian API ready`);
    });
}

start().catch(console.error);
