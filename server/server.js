import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { initDatabase } from './db/database.js';
import authRoutes from './routes/auth.js';
import projectsRoutes from './routes/projects.js';
import bugsRoutes from './routes/bugs.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/bugs', bugsRoutes);

const port = process.env.PORT;

const startServer = async () => {
    try {
        await initDatabase();
        console.log('Database initialized');

        app.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
    } catch (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
};

app.use((err, req, res, next) => {
    console.error('[ERROR]', err);
    return res.status(500).json({ message: '500 Server error' });
});

startServer();