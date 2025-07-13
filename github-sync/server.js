const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Serve static files from data directory
app.use('/data', express.static(path.join(__dirname, 'data')));

// API Routes
app.get('/api/tasks', (req, res) => {
    try {
        const tasksData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/tasks.json'), 'utf8'));
        res.json(tasksData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load tasks' });
    }
});

app.get('/api/users', (req, res) => {
    try {
        const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/users.json'), 'utf8'));
        res.json(usersData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load users' });
    }
});

app.get('/api/tribute-history', (req, res) => {
    try {
        const tributeData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/tribute-history.json'), 'utf8'));
        res.json(tributeData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load tribute history' });
    }
});

app.get('/api/config', (req, res) => {
    try {
        const configData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/config.json'), 'utf8'));
        res.json(configData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load config' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`FinDom Extension Sync Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API endpoints available at: http://localhost:${PORT}/api/`);
});

module.exports = app;
