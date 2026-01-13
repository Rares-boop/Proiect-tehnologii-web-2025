import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import { initDatabase } from "./db/database.js";
import authRoutes from "./routes/auth.js";
import projectsRoutes from "./routes/projects.js";
import bugsRoutes from "./routes/bugs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", authRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/bugs", bugsRoutes);

if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "..", "GUI", "dist");
  if (existsSync(distPath)) {
    app.use(helmet(), express.static(distPath));

    app.use((req, res) => {
      if (req.method === "GET" && !req.path.startsWith("/api")) {
        res.sendFile(path.join(distPath, "index.html"));
      }
    });
  }
}

const port = process.env.PORT;

const startServer = async () => {
  try {
    await initDatabase();
    console.log("Database initialized");

    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
};

app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  return res.status(500).json({ message: "500 Server error" });
});

startServer();
