import express from 'express';
import { getDatabase } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    try {
        const db = getDatabase();
        const bugs = await db.all(`
            SELECT b.id, b.description, b.severity, b.priority, b.commit_link, b.created_at,
                   p.name as project_name, p.id as project_id
            FROM bugs b
            JOIN projects p ON b.id_project = p.id
            WHERE b.id_tester = ?
            ORDER BY b.created_at DESC
        `, [req.user.id]);
        res.json(bugs);
    } catch (error) {
        console.error('Get bugs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { description, severity, priority, commit_link, id_project } = req.body;

        if (!description || !description.trim()) {
            return res.status(400).json({ message: 'Description is required' });
        }

        if (!severity || !severity.trim()) {
            return res.status(400).json({ message: 'Severity is required' });
        }

        if (!priority || !priority.trim()) {
            return res.status(400).json({ message: 'Priority is required' });
        }

        if (!id_project) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        const db = getDatabase();

        const project = await db.get('SELECT id FROM projects WHERE id = ?', [id_project]);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const tester = await db.get(
            'SELECT id FROM project_testers WHERE project_id = ? AND user_id = ?',
            [id_project, req.user.id]
        );

        if (!tester) {
            return res.status(403).json({ message: 'Only testers can create bugs for this project' });
        }

        const result = await db.run(
            'INSERT INTO bugs (description, severity, priority, commit_link, id_project, id_tester) VALUES (?, ?, ?, ?, ?, ?)',
            [description.trim(), severity.trim(), priority.trim(), commit_link?.trim() || null, id_project, req.user.id]
        );

        res.status(201).json({
            id: result.lastID,
            description: description.trim(),
            severity: severity.trim(),
            priority: priority.trim(),
            commit_link: commit_link?.trim() || null,
            id_project,
            id_tester: req.user.id
        });
    } catch (error) {
        console.error('Create bug error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:id/assign', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'MP') {
            return res.status(403).json({ message: 'Only MP users can assign bugs' });
        }

        const bugId = parseInt(req.params.id);
        const db = getDatabase();

        const bug = await db.get(`
            SELECT b.id, b.assigned_to, b.id_project, p.created_by
            FROM bugs b
            JOIN projects p ON b.id_project = p.id
            WHERE b.id = ?
        `, [bugId]);

        if (!bug) {
            return res.status(404).json({ message: 'Bug not found' });
        }

        if (bug.created_by !== req.user.id) {
            return res.status(403).json({ message: 'You can only assign bugs from your own projects' });
        }

        if (bug.assigned_to !== null) {
            return res.status(400).json({ message: 'Bug is already assigned to an MP' });
        }

        await db.run(
            'UPDATE bugs SET assigned_to = ? WHERE id = ?',
            [req.user.id, bugId]
        );

        const assignedBug = await db.get(`
            SELECT b.id, b.description, b.severity, b.priority, b.commit_link, b.created_at,
                   b.assigned_to, u.email as assigned_to_email, p.name as project_name, p.id as project_id
            FROM bugs b
            JOIN projects p ON b.id_project = p.id
            LEFT JOIN users u ON b.assigned_to = u.id
            WHERE b.id = ?
        `, [bugId]);

        res.json(assignedBug);
    } catch (error) {
        console.error('Assign bug error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
