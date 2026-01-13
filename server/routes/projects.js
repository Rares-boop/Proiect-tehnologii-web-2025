import express from "express";
import { getDatabase } from "../db/database.js";
import { authenticateToken, requireMP } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const projects = await db.all(
      `
            SELECT p.id, p.name as nume, p.description as descriere, p.repository, p.created_by, u.email as creator_email,
                   CASE WHEN pt.id IS NOT NULL THEN 1 ELSE 0 END as is_tester,
                   CASE WHEN pm.id IS NOT NULL THEN 1 ELSE 0 END as is_member
            FROM projects p
            JOIN users u ON p.created_by = u.id
            LEFT JOIN project_testers pt ON pt.project_id = p.id AND pt.user_id = ?
            LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ?
            ORDER BY p.created_at DESC
        `,
      [req.user.id, req.user.id]
    );
    res.json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", authenticateToken, requireMP, async (req, res) => {
  try {
    const { nume, descriere, repository, team_members } = req.body;

    if (!nume || !nume.trim()) {
      return res.status(400).json({ message: "Nume is required" });
    }

    if (nume.trim().length > 200) {
      return res
        .status(400)
        .json({ message: "Project name must be less than 200 characters" });
    }

    if (descriere && descriere.trim().length > 1000) {
      return res
        .status(400)
        .json({ message: "Description must be less than 1000 characters" });
    }

    if (repository && repository.trim()) {
      try {
        new URL(repository.trim());
      } catch (e) {
        return res
          .status(400)
          .json({ message: "Repository must be a valid URL" });
      }
    }

    const db = getDatabase();
    const result = await db.run(
      "INSERT INTO projects (name, description, repository, created_by) VALUES (?, ?, ?, ?)",
      [
        nume.trim(),
        descriere?.trim() || null,
        repository?.trim() || null,
        req.user.id,
      ]
    );

    const projectId = result.lastID;

    if (
      team_members &&
      Array.isArray(team_members) &&
      team_members.length > 0
    ) {
      const validMemberIds = team_members.filter(
        (id) => id && !isNaN(parseInt(id)) && parseInt(id) !== req.user.id
      );

      for (const memberId of validMemberIds) {
        const user = await db.get(
          "SELECT id, role FROM users WHERE id = ? AND role = ?",
          [memberId, "MP"]
        );
        if (user) {
          try {
            await db.run(
              "INSERT INTO project_members (project_id, user_id) VALUES (?, ?)",
              [projectId, memberId]
            );
          } catch (err) {}
        }
      }
    }

    res.status(201).json({
      id: projectId,
      nume,
      descriere,
      repository,
      created_by: req.user.id,
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/users/mp", authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const users = await db.all(
      "SELECT id, email FROM users WHERE role = ? AND id != ? ORDER BY email",
      ["MP", req.user.id]
    );
    res.json(users);
  } catch (error) {
    console.error("Get MP users error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id/members", authenticateToken, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Valid project ID is required" });
    }

    const db = getDatabase();
    const project = await db.get(
      "SELECT created_by FROM projects WHERE id = ?",
      [projectId]
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.created_by !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only view members of your own projects" });
    }

    const members = await db.all(
      `
            SELECT pm.user_id, u.email
            FROM project_members pm
            JOIN users u ON pm.user_id = u.id
            WHERE pm.project_id = ?
            ORDER BY u.email
        `,
      [projectId]
    );

    res.json(members);
  } catch (error) {
    console.error("Get project members error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/members", authenticateToken, requireMP, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Valid project ID is required" });
    }

    const { user_id } = req.body;
    if (!user_id || isNaN(parseInt(user_id))) {
      return res.status(400).json({ message: "Valid user ID is required" });
    }

    const db = getDatabase();
    const project = await db.get(
      "SELECT created_by FROM projects WHERE id = ?",
      [projectId]
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.created_by !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only add members to your own projects" });
    }

    if (parseInt(user_id) === req.user.id) {
      return res
        .status(400)
        .json({ message: "You are already the project creator" });
    }

    const user = await db.get(
      "SELECT id, role FROM users WHERE id = ? AND role = ?",
      [user_id, "MP"]
    );
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or is not an MP" });
    }

    const existingMember = await db.get(
      "SELECT id FROM project_members WHERE project_id = ? AND user_id = ?",
      [projectId, user_id]
    );
    if (existingMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of this project" });
    }

    await db.run(
      "INSERT INTO project_members (project_id, user_id) VALUES (?, ?)",
      [projectId, user_id]
    );

    res.status(201).json({ message: "Member added successfully" });
  } catch (error) {
    console.error("Add project member error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete(
  "/:id/members/:userId",
  authenticateToken,
  requireMP,
  async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);

      if (isNaN(projectId) || isNaN(userId)) {
        return res
          .status(400)
          .json({ message: "Valid project ID and user ID are required" });
      }

      const db = getDatabase();
      const project = await db.get(
        "SELECT created_by FROM projects WHERE id = ?",
        [projectId]
      );
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.created_by !== req.user.id) {
        return res
          .status(403)
          .json({
            message: "You can only remove members from your own projects",
          });
      }

      const member = await db.get(
        "SELECT id FROM project_members WHERE project_id = ? AND user_id = ?",
        [projectId, userId]
      );
      if (!member) {
        return res
          .status(404)
          .json({ message: "Member not found in this project" });
      }

      await db.run(
        "DELETE FROM project_members WHERE project_id = ? AND user_id = ?",
        [projectId, userId]
      );

      res.json({ message: "Member removed successfully" });
    } catch (error) {
      console.error("Remove project member error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.post("/:id/addTester", authenticateToken, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const userId = req.user.id;

    if (req.user.role !== "TST") {
      return res
        .status(403)
        .json({ message: "Only TST users can become testers" });
    }

    const db = getDatabase();

    const project = await db.get(
      "SELECT created_by FROM projects WHERE id = ?",
      [projectId]
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.created_by === userId) {
      return res
        .status(403)
        .json({ message: "Project members cannot become testers" });
    }

    const existingTester = await db.get(
      "SELECT id FROM project_testers WHERE project_id = ? AND user_id = ?",
      [projectId, userId]
    );
    if (existingTester) {
      return res
        .status(400)
        .json({ message: "You are already a tester for this project" });
    }

    await db.run(
      "INSERT INTO project_testers (project_id, user_id) VALUES (?, ?)",
      [projectId, userId]
    );

    res.status(201).json({ message: "Successfully added as tester" });
  } catch (error) {
    console.error("Add tester error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id/bugs", authenticateToken, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const db = getDatabase();

    const project = await db.get(
      "SELECT created_by FROM projects WHERE id = ?",
      [projectId]
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (req.user.role === "MP") {
      const isCreator = Number(project.created_by) === Number(req.user.id);
      const member = await db.get(
        "SELECT id FROM project_members WHERE project_id = ? AND user_id = ?",
        [projectId, req.user.id]
      );
      const isMember = !!member;

      if (!isCreator && !isMember) {
        return res
          .status(403)
          .json({
            message: "You can only view bugs for projects you are part of",
          });
      }
    }

    const bugs = await db.all(
      `
            SELECT b.id, b.description, b.severity, b.priority, b.commit_link, b.status, b.created_at,
                   u.email as tester_email, p.name as project_name, b.id_project as project_id,
                   b.assigned_to, mp.email as assigned_to_email, b.id_tester
            FROM bugs b
            JOIN projects p ON b.id_project = p.id
            JOIN users u ON b.id_tester = u.id
            LEFT JOIN users mp ON b.assigned_to = mp.id
            WHERE b.id_project = ?
            ORDER BY b.created_at DESC
        `,
      [projectId]
    );

    res.json(bugs);
  } catch (error) {
    console.error("Get project bugs error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id/testers", authenticateToken, requireMP, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Valid project ID is required" });
    }

    const db = getDatabase();
    const project = await db.get(
      "SELECT created_by FROM projects WHERE id = ?",
      [projectId]
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (Number(project.created_by) !== Number(req.user.id)) {
      return res
        .status(403)
        .json({ message: "You can only view testers of your own projects" });
    }

    const testers = await db.all(
      `
            SELECT pt.user_id, u.email
            FROM project_testers pt
            JOIN users u ON pt.user_id = u.id
            WHERE pt.project_id = ?
            ORDER BY u.email
        `,
      [projectId]
    );

    res.json(testers);
  } catch (error) {
    console.error("Get project testers error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id/testers/me", authenticateToken, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const userId = req.user.id;

    if (req.user.role !== "TST") {
      return res
        .status(403)
        .json({ message: "Only TST users can remove themselves as testers" });
    }

    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Valid project ID is required" });
    }

    const db = getDatabase();
    const project = await db.get(
      "SELECT created_by FROM projects WHERE id = ?",
      [projectId]
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const tester = await db.get(
      "SELECT id FROM project_testers WHERE project_id = ? AND user_id = ?",
      [projectId, userId]
    );
    if (!tester) {
      return res
        .status(404)
        .json({ message: "You are not a tester for this project" });
    }

    await db.run(
      "DELETE FROM project_testers WHERE project_id = ? AND user_id = ?",
      [projectId, userId]
    );

    res.json({ message: "Successfully removed as tester" });
  } catch (error) {
    console.error("Remove self as tester error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete(
  "/:id/testers/:userId",
  authenticateToken,
  requireMP,
  async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);

      if (isNaN(projectId) || isNaN(userId)) {
        return res
          .status(400)
          .json({ message: "Valid project ID and user ID are required" });
      }

      const db = getDatabase();
      const project = await db.get(
        "SELECT created_by FROM projects WHERE id = ?",
        [projectId]
      );
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (Number(project.created_by) !== Number(req.user.id)) {
        return res
          .status(403)
          .json({
            message: "You can only remove testers from your own projects",
          });
      }

      const tester = await db.get(
        "SELECT id FROM project_testers WHERE project_id = ? AND user_id = ?",
        [projectId, userId]
      );
      if (!tester) {
        return res
          .status(404)
          .json({ message: "Tester not found in this project" });
      }

      await db.run(
        "DELETE FROM project_testers WHERE project_id = ? AND user_id = ?",
        [projectId, userId]
      );

      res.json({ message: "Tester removed successfully" });
    } catch (error) {
      console.error("Remove tester error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.put("/:id", authenticateToken, requireMP, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Valid project ID is required" });
    }

    const { nume, descriere, repository } = req.body;

    if (!nume || !nume.trim()) {
      return res.status(400).json({ message: "Nume is required" });
    }

    if (nume.trim().length > 200) {
      return res
        .status(400)
        .json({ message: "Project name must be less than 200 characters" });
    }

    if (descriere && descriere.trim().length > 1000) {
      return res
        .status(400)
        .json({ message: "Description must be less than 1000 characters" });
    }

    if (repository && repository.trim()) {
      try {
        new URL(repository.trim());
      } catch (e) {
        return res
          .status(400)
          .json({ message: "Repository must be a valid URL" });
      }
    }

    const db = getDatabase();
    const project = await db.get(
      "SELECT created_by FROM projects WHERE id = ?",
      [projectId]
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (Number(project.created_by) !== Number(req.user.id)) {
      return res
        .status(403)
        .json({ message: "You can only edit your own projects" });
    }

    await db.run(
      "UPDATE projects SET name = ?, description = ?, repository = ? WHERE id = ?",
      [
        nume.trim(),
        descriere?.trim() || null,
        repository?.trim() || null,
        projectId,
      ]
    );

    res.json({ message: "Project updated successfully" });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", authenticateToken, requireMP, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Valid project ID is required" });
    }

    const db = getDatabase();
    const project = await db.get(
      "SELECT created_by FROM projects WHERE id = ?",
      [projectId]
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (Number(project.created_by) !== Number(req.user.id)) {
      return res
        .status(403)
        .json({ message: "You can only delete your own projects" });
    }

    await db.run("DELETE FROM projects WHERE id = ?", [projectId]);

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
