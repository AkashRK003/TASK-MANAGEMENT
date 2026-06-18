from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from sqlalchemy.orm import Session
import os

from database import engine, Base, get_db
import models
import schemas
import auth

# Automate Database Table instantiation on Startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TaskHQ API",
    description="REST API documentation for Internship Task Management application, built with Python FastAPI, SQLAlchemy and JWT.",
    version="1.0.0"
)

# Configure CORS Middleware for production environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to specific frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Real-Time WebSocket Connection Manager ---
class WebSocketConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[WS Connection] Client connected. Total active sessions: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"[WS Connection] Client disconnected. Total active sessions: {len(self.active_connections)}")

    async def broadcast_mutation(self, action: str, task_payload: dict):
        event_message = {
            "action": action,
            "task": task_payload
        }
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(event_message)
            except Exception:
                dead_connections.append(connection)
                
        # Flush closed lines
        for dead in dead_connections:
            self.disconnect(dead)

ws_manager = WebSocketConnectionManager()

# WebSocket Router Endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep-alive loop
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        print(f"[WS Error] Connection anomalous failure: {e}")
        ws_manager.disconnect(websocket)

# Helper to serialize task responses securely with their assignments
def serialize_task_orm(task_orm: models.Task) -> dict:
    assigned_user_dict = None
    if task_orm.assigned_user:
        assigned_user_dict = {
            "id": task_orm.assigned_user.id,
            "name": task_orm.assigned_user.name,
            "email": task_orm.assigned_user.email,
            "role": task_orm.assigned_user.role,
            "avatar_url": task_orm.assigned_user.avatar_url,
        }
    return {
        "id": task_orm.id,
        "title": task_orm.title,
        "description": task_orm.description,
        "status": task_orm.status,
        "priority": task_orm.priority,
        "due_date": task_orm.due_date,
        "created_at": task_orm.created_at.isoformat() if task_orm.created_at else None,
        "updated_at": task_orm.updated_at.isoformat() if task_orm.updated_at else None,
        "assigned_user_id": task_orm.assigned_user_id,
        "assigned_user": assigned_user_dict
    }


# --- Authentication API Routes ---

@app.post("/api/register", status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check duplicate email
    existing_user = db.query(models.User).filter(models.User.email == user_data.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address is already registered."
        )

    # Hash passkey and instantiate User model
    new_user = models.User(
        name=user_data.name,
        email=user_data.email.lower(),
        password_hash=auth.get_password_hash(user_data.password),
        role=user_data.role,
        avatar_url=user_data.avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Token instantiation
    token = auth.create_access_token(data={"id": new_user.id, "email": new_user.email})
    
    return {
        "token": token,
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "avatar_url": new_user.avatar_url
        }
    }

@app.post("/api/login")
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email.lower()).first()
    if not user or not auth.verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email coordinates or password credentials."
        )

    token = auth.create_access_token(data={"id": user.id, "email": user.email})
    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "avatar_url": user.avatar_url
        }
    }

@app.get("/api/me", response_model=schemas.UserResponse)
def get_user_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/api/users", response_model=List[schemas.UserResponse])
def list_team_members(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.User).all()


# --- Task CRUD Operations API Routes ---

@app.get("/api/tasks")
def list_tasks(
    status_filter: Optional[str] = None,
    priority_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Task)
    if status_filter:
        query = query.filter(models.Task.status == status_filter)
    if priority_filter:
        query = query.filter(models.Task.priority == priority_filter)
        
    tasks_list = query.all()
    # Serialize results to include assigned users
    return [serialize_task_orm(task) for task in tasks_list]


@app.post("/api/tasks", status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Verify assignee if exists
    if task_data.assigned_user_id:
        assignee = db.query(models.User).filter(models.User.id == task_data.assigned_user_id).first()
        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The specified assigned team user does not exist"
            )

    new_task = models.Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        priority=task_data.priority,
        due_date=task_data.due_date,
        assigned_user_id=task_data.assigned_user_id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    serialized = serialize_task_orm(new_task)
    # Trigger real-time alert broadcasts
    await ws_manager.broadcast_mutation("CREATE", serialized)
    return serialized


@app.get("/api/tasks/{task_id}")
def get_task_details(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Selected task milestone not found")
    return serialize_task_orm(task)


@app.put("/api/tasks/{task_id}")
async def update_existing_task(
    task_id: str,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Selected task milestone not found")

    if task_update.assigned_user_id is not None:
        if task_update.assigned_user_id:
            assignee = db.query(models.User).filter(models.User.id == task_update.assigned_user_id).first()
            if not assignee:
                raise HTTPException(status_code=400, detail="The selected assigned user does not exist")
            task.assigned_user_id = task_update.assigned_user_id
        else:
            task.assigned_user_id = None

    # Update atomic parameters conditionally
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.status is not None:
        task.status = task_update.status
    if task_update.priority is not None:
        task.priority = task_update.priority
    if task_update.due_date is not None:
        task.due_date = task_update.due_date

    db.commit()
    db.refresh(task)

    serialized = serialize_task_orm(task)
    # Trigger broadcast updating mutations
    await ws_manager.broadcast_mutation("UPDATE", serialized)
    return serialized


@app.delete("/api/tasks/{task_id}")
async def delete_existing_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Selected task milestone not found")

    db.delete(task)
    db.commit()

    # Trigger broadcast alert deletion
    await ws_manager.broadcast_mutation("DELETE", {"id": task_id})
    return {"message": "Task successfully deleted"}


# Launch script for execution: run python main.py
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
