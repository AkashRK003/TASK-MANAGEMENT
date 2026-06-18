/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "taskmanager-super-secret-key-2026";
const DATA_FILE = path.join(process.cwd(), "data-store.json");

// Define interfaces for backend models
interface DBUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  avatarUrl?: string;
}

interface DBTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  assignedUserId?: string;
}

interface DatabaseSchema {
  users: DBUser[];
  tasks: DBTask[];
}

// Ensure the data store file exists with seed data
function initializeDatabase() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      JSON.parse(content);
      return;
    } catch (e) {
      console.error("Failed to parse database file, re-initializing...", e);
    }
  }

  // Pre-seed users
  const adminSalt = bcrypt.genSaltSync(10);
  const managerSalt = bcrypt.genSaltSync(10);
  const devSalt = bcrypt.genSaltSync(10);

  const seedUsers: DBUser[] = [
    {
      id: "u-admin",
      name: "Sophia Vance",
      email: "sophia@example.com",
      passwordHash: bcrypt.hashSync("admin123", adminSalt),
      role: "Administrator",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
    },
    {
      id: "u-manager",
      name: "Marcus Aurelius",
      email: "marcus@example.com",
      passwordHash: bcrypt.hashSync("manager123", managerSalt),
      role: "Project Manager",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces",
    },
    {
      id: "u-dev",
      name: "Liam O'Connor",
      email: "liam@example.com",
      passwordHash: bcrypt.hashSync("developer123", devSalt),
      role: "Senior Developer",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
    }
  ];

  // Pre-seed tasks with various states (including one Overdue task)
  const now = new Date();
  const pastDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; // 5 days ago
  const futureDate1 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; // 3 days details
  const futureDate2 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; // 10 days details

  const seedTasks: DBTask[] = [
    {
      id: "t-1",
      title: "Set up PostgreSQL Database Container",
      description: "Provision AWS RDS PostgreSQL database cluster and configure security groups for backend API access.",
      status: "Completed",
      priority: "High",
      dueDate: pastDate,
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      assignedUserId: "u-dev",
    },
    {
      id: "t-2",
      title: "Design REST API Endpoints with FastAPI",
      description: "Implement FastAPI router endpoints for user registration, JWT authentication and Tasks CRUD resources. Document with Swagger APISpec.",
      status: "In Progress",
      priority: "High",
      dueDate: futureDate1,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
      assignedUserId: "u-dev",
    },
    {
      id: "t-3",
      title: "Integrate Real-Time WebSocket Alerts",
      description: "Connect frontend client websockets to broadcast live task update mutations across multiple open sessions.",
      status: "Pending",
      priority: "Medium",
      dueDate: futureDate2,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      assignedUserId: "u-manager",
    },
    {
      id: "t-4",
      title: "Update Project Specifications Document",
      description: "Coordinate with the security team to review role-based access control guidelines and scope authentication rules. This is urgent.",
      status: "Pending",
      priority: "High",
      dueDate: pastDate, // Overdue pending task
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      assignedUserId: "u-manager",
    },
  ];

  const db: DatabaseSchema = {
    users: seedUsers,
    tasks: seedTasks,
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
  console.log("Database initialized and written to", DATA_FILE);
}

initializeDatabase();

// Load / Save Helpers
function getDB(): DatabaseSchema {
  try {
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    return { users: [], tasks: [] };
  }
}

function saveDB(db: DatabaseSchema) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // CORS middleware for safety
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  const server = http.createServer(app);

  // Setup WebSocket Server for real-time dashboard notifications
  const wss = new WebSocketServer({ noServer: true });
  const wsClients = new Set<WebSocket>();

  wss.on("connection", (ws: WebSocket) => {
    wsClients.add(ws);
    console.log(`WebSocket Client connected. Active clients: ${wsClients.size}`);

    ws.on("close", () => {
      wsClients.delete(ws);
      console.log(`WebSocket Client disconnected. Active clients: ${wsClients.size}`);
    });
  });

  // Handle server upgrade for WS handshakes
  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;
    if (pathname === "/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Helper to notify all WS clients about a task modification
  function broadcastTaskUpdate(action: string, task: any) {
    const event = JSON.stringify({ action, task });
    wsClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(event);
      }
    });
  }

  // --- API Authentication Routes ---

  // POST /api/register
  app.post("/api/register", (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "Missing required fields (name, email, password)" });
      return;
    }

    const db = getDB();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      res.status(400).json({ error: "A user with this email address already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Give a consistent placeholder avatar or let them customize
    const avatarUrl = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces`;

    const newUser: DBUser = {
      id: `u-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || "Contributor",
      avatarUrl,
    };

    db.users.push(newUser);
    saveDB(db);

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: "24h" });

    // Output secure user payload without hash
    const { passwordHash: _, ...userSafe } = newUser;
    res.status(201).json({ token, user: userSafe });
  });

  // POST /api/login
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Missing email or password" });
      return;
    }

    const db = getDB();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "24h" });
    const { passwordHash: _, ...userSafe } = user;
    res.json({ token, user: userSafe });
  });

  // Authentication Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token missing" });
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: "Invalid/expired verification token" });
      }
      const db = getDB();
      const user = db.users.find((u) => u.id === decoded.id);
      if (!user) {
        return res.status(404).json({ error: "Session expired or user not found" });
      }
      req.user = user;
      next();
    });
  };

  // GET /api/me (Check active profile)
  app.get("/api/me", authenticateToken, (req: any, res) => {
    const { passwordHash: _, ...userSafe } = req.user;
    res.json({ user: userSafe });
  });

  // GET /api/users (Get users list for dropdown task assignation)
  app.get("/api/users", authenticateToken, (req, res) => {
    const db = getDB();
    const safeUsers = db.users.map(({ passwordHash, ...user }) => user);
    res.json(safeUsers);
  });

  // --- Tasks CRUD Routes ---

  // GET /api/tasks (View all tasks with resolution of assigned users)
  app.get("/api/tasks", authenticateToken, (req, res) => {
    const db = getDB();
    const tasksWithUsers = db.tasks.map((task) => {
      const assignedUser = db.users.find((u) => u.id === task.assignedUserId);
      let userSafe = undefined;
      if (assignedUser) {
        const { passwordHash, ...safe } = assignedUser;
        userSafe = safe;
      }
      return {
        ...task,
        assignedUser: userSafe,
      };
    });

    res.json(tasksWithUsers);
  });

  // POST /api/tasks (New Task)
  app.post("/api/tasks", authenticateToken, (req: any, res) => {
    const { title, description, status, priority, dueDate, assignedUserId } = req.body;

    if (!title || !status || !priority || !dueDate) {
      res.status(400).json({ error: "Missing required fields (title, status, priority, dueDate)" });
      return;
    }

    const db = getDB();

    // Verify assigned user exists
    if (assignedUserId) {
      const userExists = db.users.some((u) => u.id === assignedUserId);
      if (!userExists) {
        res.status(400).json({ error: "The selected assigned user does not exist" });
        return;
      }
    }

    const newTask: DBTask = {
      id: `t-${Date.now()}`,
      title,
      description: description || "",
      status,
      priority,
      dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedUserId: assignedUserId || null,
    };

    db.tasks.push(newTask);
    saveDB(db);

    // Resolve details for broadcast and response
    const resolvedAssignedUser = db.users.find((u) => u.id === newTask.assignedUserId);
    const safeUser = resolvedAssignedUser
      ? (() => {
          const { passwordHash, ...rest } = resolvedAssignedUser;
          return rest;
        })()
      : undefined;

    const fullTask = { ...newTask, assignedUser: safeUser };

    broadcastTaskUpdate("CREATE", fullTask);
    res.status(201).json(fullTask);
  });

  // GET /api/tasks/:id (Single details)
  app.get("/api/tasks/:id", authenticateToken, (req, res) => {
    const db = getDB();
    const task = db.tasks.find((t) => t.id === req.params.id);

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const assignedUser = db.users.find((u) => u.id === task.assignedUserId);
    const safeUser = assignedUser
      ? (() => {
          const { passwordHash, ...rest } = assignedUser;
          return rest;
        })()
      : undefined;

    res.json({ ...task, assignedUser: safeUser });
  });

  // PUT /api/tasks/:id (Update task status, info, priority or assigned user)
  app.put("/api/tasks/:id", authenticateToken, (req, res) => {
    const { title, description, status, priority, dueDate, assignedUserId } = req.body;

    const db = getDB();
    const taskIndex = db.tasks.findIndex((t) => t.id === req.params.id);

    if (taskIndex === -1) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    if (assignedUserId) {
      const userExists = db.users.some((u) => u.id === assignedUserId);
      if (!userExists) {
        res.status(400).json({ error: "The assigned user does not exist" });
        return;
      }
    }

    const currentTask = db.tasks[taskIndex];
    const updatedTask: DBTask = {
      ...currentTask,
      title: title !== undefined ? title : currentTask.title,
      description: description !== undefined ? description : currentTask.description,
      status: status !== undefined ? status : currentTask.status,
      priority: priority !== undefined ? priority : currentTask.priority,
      dueDate: dueDate !== undefined ? dueDate : currentTask.dueDate,
      assignedUserId: assignedUserId !== undefined ? assignedUserId : currentTask.assignedUserId,
      updatedAt: new Date().toISOString(),
    };

    db.tasks[taskIndex] = updatedTask;
    saveDB(db);

    const resolvedAssignedUser = db.users.find((u) => u.id === updatedTask.assignedUserId);
    const safeUser = resolvedAssignedUser
      ? (() => {
          const { passwordHash, ...rest } = resolvedAssignedUser;
          return rest;
        })()
      : undefined;

    const fullTask = { ...updatedTask, assignedUser: safeUser };

    broadcastTaskUpdate("UPDATE", fullTask);
    res.json(fullTask);
  });

  // DELETE /api/tasks/:id (Delete Task completely)
  app.delete("/api/tasks/:id", authenticateToken, (req, res) => {
    const db = getDB();
    const task = db.tasks.find((t) => t.id === req.params.id);

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    db.tasks = db.tasks.filter((t) => t.id !== req.params.id);
    saveDB(db);

    broadcastTaskUpdate("DELETE", { id: req.params.id });
    res.json({ message: "Task successfully deleted" });
  });

  // Vite Integration & SPA router
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting backend in developmental mode (Mounting Vite)...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting backend in production mode.");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`TaskManager Application serves fully functional backend at:`);
    console.log(`👉 http://0.0.0.0:${PORT}`);
  });
}

startServer();
