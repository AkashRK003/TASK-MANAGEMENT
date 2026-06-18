# 📝 TaskHQ: Professional Task Management Application (FastAPI backend + React SPA client)

This is a production-ready, full-stack **Task Management Application** built for the Senior Developer internship project. It is structured with a high-performance **Python FastAPI** backend (SQLAlchemy ORM + SQLite/PostgreSQL) and a beautiful, custom **React + Vite** single-page application frontend.

---

## 🏗️ Architecture Design & Module Integration

The application follows a standard decoupled full-stack model where the React application communicates with the FastAPI service via a highly optimized REST API layer for configuration & transactions, and a continuous WebSocket handshake protocol for real-time dashboard updates.

```
+------------------------------------------------------------+
|                         FRONTEND CORES                     |
|                                                            |
|   +-----------------------+     +----------------------+   |
|   |   Login Page          |     |  Dashboard Page      |   |
|   +-----------+-----------+     +----------+-----------+   |
|               |                            |               |
|               | (REST JSON API calls)      | (Live WS)     |
+---------------v----------------------------v---------------+
                |                            |
                | http/https                 | ws/wss
+---------------v----------------------------v---------------+
|                         BACKEND SERVICES                   |
|                                                            |
|          +--------------------------------------+          |
|          |         Python FastAPI CORE          |          |
|          +----+----------------------------+----+          |
|               |                            |               |
|               |                            | (ORM Queries) |
|      (JWT / Auth Guard)                    |               |
|               |                     +------v-------+       |
|      +--------v---------+           |  SQLAlchemy  |       |
|      | Passlib (Bcrypt) |           +------+-------+       |
|      +------------------+                  |               |
+--------------------------------------------v---------------+
                                             |
                                      +------v-------+
                                      |  PostgreSQL  |
                                      |  or SQLite   |
                                      +--------------+
```

### 1. How Each Module Works

*   **Authentication Engine (`auth.py`)**: Uses the `passlib[bcrypt]` security wrapper to hash passwords securely during sign-up, ensuring no plain-text passwords reside in database registers. Authenticated logins generate encrypted **HS256 JWT access tokens** with expiration parameters. It includes helper dependencies like `get_current_user` to intercept and block unverified endpoint operations.
*   **Database Schema & Models (`database.py`, `models.py`)**: Imports the standard SQLAlchemy `declarative_base` template. The relational mappings establish a **one-to-many relationship**:
    *   A `User` table holds names, emails, salted password hashes, custom avatar links, and profiles.
    *   A `Task` table records task specifications, due dates, statuses, and links (`assigned_user_id`) mapping directly to the `User` primary key with `SET NULL` deletion rules.
*   **Data Validation (`schemas.py`)**: Handled using **Pydantic V2**. It defines specific read/write validation parameters for payloads (e.g. confirming email formats via `EmailStr`, enforcing minimum lengths via `Field`).
*   **API Router Entrypoint (`main.py`)**: Orchestrates CORS policies, mounts endpoint resources (auth paths, CRUD endpoints), builds connection lists for WebSockets, and automates schema migrations upon engine startup.

---

## 🔗 Endpoint Blueprint API Specification

All paths are prefixed by `/api` to prevent collision with static routes:

### 🔑 Authentication Endpoints
*   `POST /api/register` — Creates a brand new developer account and issues an access token.
*   `POST /api/login` — Verifies email/password credentials and yields active token profiles.
*   `GET /api/me` — Decrypts auth headers and returns active profile details.
*   `GET /api/users` — Pulls lists of registered team developers for dropdowns.

### 📋 Task CRUD Resources (JWT Protected)
*   `GET /api/tasks` — Fetches complete workflows, with options to filter by status or priority.
*   `POST /api/tasks` — Publishes a task. Triggers live WebSocket sync.
*   `GET /api/tasks/{id}` — Fetches details on an individual task.
*   `PUT /api/tasks/{id}` — Modifies statuses, checklists, assignees. Triggers live WebSocket sync.
*   `DELETE /api/tasks/{id}` — Removes a task. Triggers live WebSocket sync.

### 🔌 Real-Time Communications
*   `WS /ws` — Secure WebSocket handshake layer tracking open active dashboard sessions. Emits JSON mutation payloads when database states pivot.

---

## ⚡ Setup & Run Guidelines

Follow these directions to spin up the FastAPI service on local machines:

### Prerequisite Dependencies
- Python 3.10 or higher
- pip (package manager)

### 1. Code Preparation & Virtual Environment
```bash
# Enter python directory
cd backend-python

# Instantiate internal virtual environment
python -m venv venv

# Activate venv (Unix macOS/Linux)
source venv/bin/activate

# Activate venv (Windows)
venv\Scripts\activate
```

### 2. Dependency Resolution
```bash
# Up-to-date pip utilities
pip install --upgrade pip

# Install dependencies from requirements
pip install -r requirements.txt
```

### 3. Environment Allocation
Copy the example file to initiate database paths:
```bash
cp .env.example .env
```
*(By default, SQLAlchemy creates a lightweight SQL database locally inside the project path root named `tasks.db`)*

### 4. Running the FastAPI server
```bash
python main.py
```
Your FastAPI backend server will spin up on **`http://localhost:8000`**. You can explore your APIs, test routes, and review schemas interactively by navigating to **`http://localhost:8000/docs`** to access the automated **Swagger UI APISpec Docs**!

---

## 🚀 Preparing Frontend Connections

To hook your custom React workspace up to your Python backend:
1. Ensure the backend is run on `port 8000`.
2. Configure any request proxies inside React's source code (like `src/api.ts` base coordinates or `vite.config.ts` proxies) to route to `http://localhost:8000`.
3. Launch your React development server simultaneously to enjoy cohesive data bindings across both applications!
