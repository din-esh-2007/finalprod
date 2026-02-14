const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const db = await getDb();
        const result = db.exec("SELECT * FROM users WHERE username = ?", [username]);

        if (result.length === 0 || result[0].values.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const columns = result[0].columns;
        const row = result[0].values[0];
        const user = {};
        columns.forEach((col, idx) => { user[col] = row[idx]; });

        if (user.status === 'suspended') {
            return res.status(403).json({ error: 'Account suspended. Contact your administrator.' });
        }

        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role,
                position: user.position,
                email: user.email,
                status: user.status
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No token' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const db = await getDb();
        const result = db.exec("SELECT id, name, username, role, position, email, status FROM users WHERE id = ?", [decoded.id]);

        if (result.length === 0 || result[0].values.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const columns = result[0].columns;
        const row = result[0].values[0];
        const user = {};
        columns.forEach((col, idx) => { user[col] = row[idx]; });

        res.json({ user });
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;
