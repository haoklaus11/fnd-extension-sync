// Task routes for FinDom Elite Tracker API
// Handles CRUD operations for tasks

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Path to tasks data file
const TASKS_FILE = path.join(__dirname, '../../github/tasks.json');

// Helper function to read tasks
async function readTasks() {
    try {
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading tasks:', error);
        return { tasks: [] };
    }
}

// Helper function to write tasks
async function writeTasks(tasksData) {
    try {
        await fs.writeFile(TASKS_FILE, JSON.stringify(tasksData, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing tasks:', error);
        return false;
    }
}

// GET /api/tasks - Get all tasks
router.get('/', async (req, res) => {
    try {
        const tasksData = await readTasks();
        res.json(tasksData);
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// GET /api/tasks/:id - Get a specific task
router.get('/:id', async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const tasksData = await readTasks();
        const task = tasksData.tasks.find(t => t.id === taskId);
        
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.json({ task });
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ error: 'Failed to fetch task' });
    }
});

// POST /api/tasks - Create a new task
router.post('/', async (req, res) => {
    try {
        const { title, description, tribute, xp, difficulty, deadline } = req.body;
        
        // Validation
        if (!title || !description || !tribute || !xp || !difficulty || !deadline) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!validDifficulties.includes(difficulty)) {
            return res.status(400).json({ error: 'Invalid difficulty level' });
        }
        
        const tasksData = await readTasks();
        const newTask = {
            id: Date.now(),
            title,
            description,
            tribute,
            xp: parseInt(xp),
            difficulty,
            status: 'PENDING',
            deadline: new Date(deadline).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        tasksData.tasks.push(newTask);
        
        const success = await writeTasks(tasksData);
        if (!success) {
            return res.status(500).json({ error: 'Failed to save task' });
        }
        
        res.status(201).json({ task: newTask });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const updates = req.body;
        
        const tasksData = await readTasks();
        const taskIndex = tasksData.tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        // Validate difficulty if provided
        if (updates.difficulty) {
            const validDifficulties = ['easy', 'medium', 'hard'];
            if (!validDifficulties.includes(updates.difficulty)) {
                return res.status(400).json({ error: 'Invalid difficulty level' });
            }
        }
        
        // Validate status if provided
        if (updates.status) {
            const validStatuses = ['PENDING', 'COMPLETED'];
            if (!validStatuses.includes(updates.status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }
        }
        
        // Update task
        tasksData.tasks[taskIndex] = {
            ...tasksData.tasks[taskIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        const success = await writeTasks(tasksData);
        if (!success) {
            return res.status(500).json({ error: 'Failed to update task' });
        }
        
        res.json({ task: tasksData.tasks[taskIndex] });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const tasksData = await readTasks();
        const taskIndex = tasksData.tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        tasksData.tasks.splice(taskIndex, 1);
        
        const success = await writeTasks(tasksData);
        if (!success) {
            return res.status(500).json({ error: 'Failed to delete task' });
        }
        
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// PATCH /api/tasks/:id/status - Update task status
router.patch('/:id/status', async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const { status } = req.body;
        
        const validStatuses = ['PENDING', 'COMPLETED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const tasksData = await readTasks();
        const taskIndex = tasksData.tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        tasksData.tasks[taskIndex].status = status;
        tasksData.tasks[taskIndex].updatedAt = new Date().toISOString();
        
        const success = await writeTasks(tasksData);
        if (!success) {
            return res.status(500).json({ error: 'Failed to update task status' });
        }
        
        res.json({ task: tasksData.tasks[taskIndex] });
    } catch (error) {
        console.error('Update task status error:', error);
        res.status(500).json({ error: 'Failed to update task status' });
    }
});

// GET /api/tasks/filter/:difficulty - Filter tasks by difficulty
router.get('/filter/:difficulty', async (req, res) => {
    try {
        const difficulty = req.params.difficulty;
        const validDifficulties = ['easy', 'medium', 'hard'];
        
        if (!validDifficulties.includes(difficulty)) {
            return res.status(400).json({ error: 'Invalid difficulty level' });
        }
        
        const tasksData = await readTasks();
        const filteredTasks = tasksData.tasks.filter(task => task.difficulty === difficulty);
        
        res.json({ tasks: filteredTasks });
    } catch (error) {
        console.error('Filter tasks error:', error);
        res.status(500).json({ error: 'Failed to filter tasks' });
    }
});

// GET /api/tasks/status/:status - Filter tasks by status
router.get('/status/:status', async (req, res) => {
    try {
        const status = req.params.status.toUpperCase();
        const validStatuses = ['PENDING', 'COMPLETED'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const tasksData = await readTasks();
        const filteredTasks = tasksData.tasks.filter(task => task.status === status);
        
        res.json({ tasks: filteredTasks });
    } catch (error) {
        console.error('Filter tasks by status error:', error);
        res.status(500).json({ error: 'Failed to filter tasks by status' });
    }
});

module.exports = router;
