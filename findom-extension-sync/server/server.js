// Express server for FinDom Elite Tracker
// Handles API endpoints and GitHub webhook integration

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Import route handlers
const taskRoutes = require('./routes/tasks');

// Use routes
app.use('/api/tasks', taskRoutes);

// GitHub webhook endpoint
app.post('/webhook/github', async (req, res) => {
    try {
        const signature = req.headers['x-hub-signature-256'];
        const payload = JSON.stringify(req.body);
        const secret = process.env.GITHUB_WEBHOOK_SECRET;
        
        if (secret) {
            const expectedSignature = 'sha256=' + crypto
                .createHmac('sha256', secret)
                .update(payload)
                .digest('hex');
            
            if (signature !== expectedSignature) {
                return res.status(401).json({ error: 'Invalid signature' });
            }
        }
        
        // Handle push events
        if (req.body.ref === 'refs/heads/main') {
            console.log('Repository updated, syncing data...');
            // Here you could trigger data sync operations
        }
        
        res.json({ message: 'Webhook received' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
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

// API documentation endpoint
app.get('/api/docs', (req, res) => {
    res.json({
        endpoints: {
            'GET /api/tasks': 'Get all tasks',
            'POST /api/tasks': 'Create a new task',
            'PUT /api/tasks/:id': 'Update a task',
            'DELETE /api/tasks/:id': 'Delete a task',
            'GET /health': 'Health check',
            'POST /webhook/github': 'GitHub webhook'
        },
        version: '1.0.0'
    });
});

// Validation endpoints
app.post('/api/validate/code', (req, res) => {
    const { code } = req.body;
    
    const validCodes = [
        'FINDOM2024',
        'ELITE-SLAVE-001',
        'SUBMIT-NOW',
        'GODDESS-APPROVED',
        'TRIBUTE-READY'
    ];
    
    const isValid = validCodes.includes(code?.toUpperCase());
    
    res.json({
        valid: isValid,
        message: isValid ? 'Code validated successfully' : 'Invalid activation code'
    });
});

app.post('/api/validate/token', async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }
    
    try {
        // Test the token by making a simple API call
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            res.json({
                valid: true,
                user: userData.login,
                message: 'Token validated successfully'
            });
        } else {
            res.json({
                valid: false,
                message: 'Invalid GitHub token'
            });
        }
    } catch (error) {
        console.error('Token validation error:', error);
        res.status(500).json({ error: 'Token validation failed' });
    }
});

// User management endpoints
app.get('/api/users', async (req, res) => {
    try {
        // In a real app, this would query a database
        const mockUsers = [
            {
                id: 1,
                username: 'submissive_slave_1',
                xp: 2500,
                completedTasks: 15,
                joinedDate: '2024-01-15T10:00:00Z',
                lastActivity: '2024-01-20T14:30:00Z',
                status: 'active'
            },
            {
                id: 2,
                username: 'devoted_servant_2',
                xp: 1800,
                completedTasks: 12,
                joinedDate: '2024-01-18T16:45:00Z',
                lastActivity: '2024-01-20T09:15:00Z',
                status: 'active'
            }
        ];
        
        res.json({ users: mockUsers });
    } catch (error) {
        console.error('Users fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.get('/api/tribute/history', async (req, res) => {
    try {
        // In a real app, this would query a database
        const mockHistory = [
            {
                id: 1,
                userId: 1,
                amount: 50,
                taskId: 1,
                date: '2024-01-20T08:00:00Z',
                status: 'completed'
            },
            {
                id: 2,
                userId: 2,
                amount: 100,
                taskId: 2,
                date: '2024-01-19T20:30:00Z',
                status: 'completed'
            }
        ];
        
        res.json({ history: mockHistory });
    } catch (error) {
        console.error('Tribute history fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch tribute history' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`FinDom Elite Tracker server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API docs: http://localhost:${PORT}/api/docs`);
});

module.exports = app;
