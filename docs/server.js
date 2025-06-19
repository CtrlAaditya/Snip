const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

// In-memory user store (in production, use a database)
const users = {
    'admin': '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4V87jt.Q5W153pJY2EXRfwC72zYAD2W' // password: password123
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Middleware to check authentication
const checkAuth = (req, res, next) => {
    if (req.session.authenticated) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Authentication status check
app.get('/api/check-auth', (req, res) => {
    res.json({
        authenticated: req.session.authenticated || false,
        username: req.session.username || null
    });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    if (users[username]) {
        const valid = await bcrypt.compare(password, users[username]);
        if (valid) {
            req.session.authenticated = true;
            req.session.username = username;
            res.json({ success: true });
        } else {
            res.status(401).json({ error: 'Invalid password' });
        }
    } else {
        res.status(401).json({ error: 'User not found' });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Static file serving
app.use(express.static(__dirname));

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
