import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import 'dotenv/config';

let db = null;

export async function initDatabase() {
    db = await open({
        filename: process.env.DB_PATH,
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'TST',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            repository TEXT,
            created_by INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS project_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(project_id, user_id)
        );

        CREATE TABLE IF NOT EXISTS project_testers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(project_id, user_id)
        );

        CREATE TABLE IF NOT EXISTS bugs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL,
            severity TEXT NOT NULL,
            priority TEXT NOT NULL,
            commit_link TEXT,
            id_project INTEGER NOT NULL,
            id_tester INTEGER NOT NULL,
            assigned_to INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_project) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (id_tester) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
        );
    `);

    try {
        await db.run('ALTER TABLE bugs ADD COLUMN assigned_to INTEGER');
    } catch (err) {
    }

    try {
        await db.run('ALTER TABLE bugs ADD COLUMN status TEXT DEFAULT "Open"');
    } catch (err) {
    }

    await db.exec(`
        CREATE INDEX IF NOT EXISTS idx_bugs_project ON bugs(id_project);
        CREATE INDEX IF NOT EXISTS idx_bugs_tester ON bugs(id_tester);
        CREATE INDEX IF NOT EXISTS idx_bugs_assigned ON bugs(assigned_to);
        CREATE INDEX IF NOT EXISTS idx_bugs_status ON bugs(status);
        CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
        CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
        CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
        CREATE INDEX IF NOT EXISTS idx_project_testers_project ON project_testers(project_id);
        CREATE INDEX IF NOT EXISTS idx_project_testers_user ON project_testers(user_id);
    `);

    return db;
}

export function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
}

