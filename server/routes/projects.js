import express from 'express';
import { getDatabase } from '../db/database.js';
import { authenticateToken, requireMP } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    try {
        const db = getDatabase();
        const projects = await db.all(`
            SELECT p.id, p.name as nume, p.description as descriere, p.repository, p.created_by, u.email as creator_email,
                   CASE WHEN pt.id IS NOT NULL THEN 1 ELSE 0 END as is_tester
            FROM projects p
            JOIN users u ON p.created_by = u.id
            LEFT JOIN project_testers pt ON pt.project_id = p.id AND pt.user_id = ?
            ORDER BY p.created_at DESC
        `, [req.user.id]);
        res.json(projects);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', authenticateToken, requireMP, async (req, res) => {
    try {
        const { nume, descriere, repository } = req.body;

        if (!nume || !nume.trim()) {
            return res.status(400).json({ message: 'Nume is required' });
        }

        const db = getDatabase();
        const result = await db.run(
            'INSERT INTO projects (name, description, repository, created_by) VALUES (?, ?, ?, ?)',
            [nume.trim(), descriere?.trim() || null, repository?.trim() || null, req.user.id]
        );

        res.status(201).json({
            id: result.lastID,
            nume,
            descriere,
            repository,
            created_by: req.user.id
        });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:id/addTester', authenticateToken, async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        const userId = req.user.id;

        if (req.user.role === 'MP') {
            return res.status(403).json({ message: 'Only students can become testers' });
        }

        const db = getDatabase();
        
        const project = await db.get('SELECT created_by FROM projects WHERE id = ?', [projectId]);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.created_by === userId) {
            return res.status(403).json({ message: 'Project members cannot become testers' });
        }

        const existingTester = await db.get(
            'SELECT id FROM project_testers WHERE project_id = ? AND user_id = ?',
            [projectId, userId]
        );
        if (existingTester) {
            return res.status(400).json({ message: 'You are already a tester for this project' });
        }

        await db.run(
            'INSERT INTO project_testers (project_id, user_id) VALUES (?, ?)',
            [projectId, userId]
        );

        res.status(201).json({ message: 'Successfully added as tester' });
    } catch (error) {
        console.error('Add tester error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;