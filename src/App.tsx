/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { User, Task, TaskStatus, TaskPriority } from "./types";
import { getMe, login as apiLogin, register as apiRegister, getTasks, createTask, updateTask, deleteTask, removeAuthToken, getAuthToken } from "./api";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TaskDetails from "./pages/TaskDetails";
import TaskForm from "./components/TaskForm";
import { HelpCircle, Trash2, X } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState<string>("dashboard");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);

  // Custom visual state delete modal
  const [deleteModalTaskId, setDeleteModalTaskId] = useState<string | null>(null);

  // Initialize Session
  useEffect(() => {
    const initializeSession = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getMe();
        setUser(currentUser);
        // Load initial tasks
        const initialTasks = await getTasks();
        setTasks(initialTasks);
      } catch (err) {
        console.warn("Invalid session token or backend host unreachable.", err);
        removeAuthToken();
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  // Set up WebSocket active connection stream for real-time syncing
  useEffect(() => {
    if (!user) {
      setWsConnected(false);
      return;
    }

    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const establishWebSocket = () => {
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      // Ensure we target the exact sandbox origin
      const wsUrl = `${proto}//${window.location.host}/ws`;
      console.log("[WebSocket] Connecting to:", wsUrl);

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[WebSocket] Handshake successful, sync running.");
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { action, task } = data;
          console.log("[WebSocket] Message received. Action:", action, "Task:", task);

          if (action === "CREATE") {
            setTasks((prev) => {
              if (prev.some((item) => item.id === task.id)) return prev;
              return [task, ...prev];
            });
          } else if (action === "UPDATE") {
            setTasks((prev) => prev.map((item) => (item.id === task.id ? task : item)));
          } else if (action === "DELETE") {
            setTasks((prev) => prev.filter((item) => item.id !== task.id));
            if (selectedTaskId === task.id) {
              setSelectedTaskId(null);
              setCurrentPage("dashboard");
            }
          }
        } catch (e) {
          console.error("[WebSocket] Failed parsing pipeline frame:", e);
        }
      };

      ws.onclose = () => {
        console.warn("[WebSocket] Handshake disconnected. Reconnecting in 5s...");
        setWsConnected(false);
        reconnectTimeout = setTimeout(establishWebSocket, 5000);
      };

      ws.onerror = (err) => {
        console.error("[WebSocket] Transport error occurs:", err);
      };
    };

    establishWebSocket();

    return () => {
      if (ws) {
        ws.onclose = null; // Unbind connection retry loop on unmount
        ws.close();
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [user, selectedTaskId]);

  const loadTasksPipeline = async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      const updatedTasks = await getTasks();
      setTasks(updatedTasks);
    } catch (err: any) {
      setGlobalError(err.message || "Failed to load workflow state");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async (token: string, loggedUser: User) => {
    setUser(loggedUser);
    setCurrentPage("dashboard");
    loadTasksPipeline();
  };

  const handleRegisterSuccess = async (token: string, registeredUser: User) => {
    setUser(registeredUser);
    setCurrentPage("dashboard");
    loadTasksPipeline();
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    setTasks([]);
    setCurrentPage("dashboard");
  };

  // CRUD Core Submissions

  const handleCreateTaskSubmit = async (taskData: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    assignedUserId: string | null;
  }) => {
    setLoading(true);
    setGlobalError(null);
    try {
      await createTask(taskData);
      setCurrentPage("dashboard");
    } catch (err: any) {
      setGlobalError(err.message || "Error submitting new task element");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTaskSubmit = async (taskData: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    assignedUserId: string | null;
  }) => {
    if (!selectedTaskId) return;
    setLoading(true);
    setGlobalError(null);
    try {
      await updateTask(selectedTaskId, taskData);
      setCurrentPage("dashboard");
      setSelectedTaskId(null);
    } catch (err: any) {
      setGlobalError(err.message || "Error updating task parameters");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteTaskAndExecute = async () => {
    if (!deleteModalTaskId) return;
    setLoading(true);
    setGlobalError(null);
    try {
      await deleteTask(deleteModalTaskId);
      setDeleteModalTaskId(null);
      // If we are currently viewing details of this deleted task, return to dashboard
      if (selectedTaskId === deleteModalTaskId) {
        setSelectedTaskId(null);
        setCurrentPage("dashboard");
      }
    } catch (err: any) {
      setGlobalError(err.message || "Failed to delete task milestone");
    } finally {
      setLoading(false);
    }
  };

  // View Routing Handlers
  const handleViewTaskDetails = (id: string) => {
    setSelectedTaskId(id);
    setCurrentPage("task-details");
  };

  const handleInitEditTask = (id: string) => {
    setSelectedTaskId(id);
    setCurrentPage("edit-task");
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteModalTaskId(id);
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case "dashboard":
        return "Task Dashboard";
      case "create-task":
        return "Create New Task";
      case "edit-task":
        return "Edit Task Specifications";
      case "task-details":
        return "Task Specifications Details";
      default:
        return "Project Workspace";
    }
  };

  const activeTaskObj = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) || null : null;

  // Render Loader if initializing session
  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-xs font-semibold text-slate-500 font-mono tracking-widest uppercase">Connecting to TaskHQ...</span>
        </div>
      </div>
    );
  }

  // Not logged in routing
  if (!user) {
    if (currentPage === "register") {
      return (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          onNavigateToLogin={() => setCurrentPage("login")}
          onRegisterAction={apiRegister}
        />
      );
    }
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => setCurrentPage("register")}
        onLoginAction={apiLogin}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-transparent text-slate-700">
      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          setSelectedTaskId(null);
        }}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Panel */}
        <Header
          user={user}
          wsConnected={wsConnected}
          onLogout={handleLogout}
          currentPageTitle={getPageTitle()}
        />

        {/* Inner Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          {globalError && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-150 text-xs font-semibold text-red-700 animate-pulse flex items-center justify-between">
              <span>{globalError}</span>
              <button onClick={() => setGlobalError(null)} className="text-red-500 hover:text-red-700 cursor-pointer text-sm font-bold">Dismiss</button>
            </div>
          )}

          {/* Conditional View Router */}
          <div className="fade-in">
            {currentPage === "dashboard" && (
              <Dashboard
                tasks={tasks}
                onViewDetails={handleViewTaskDetails}
                onEditTask={handleInitEditTask}
                onDeleteTask={handleDeleteRequest}
                onNavigateToCreate={() => setCurrentPage("create-task")}
                loading={loading}
                onRefresh={loadTasksPipeline}
              />
            )}

            {currentPage === "task-details" && (
              <TaskDetails
                task={activeTaskObj}
                onBack={() => setCurrentPage("dashboard")}
                onEdit={handleInitEditTask}
                onDelete={handleDeleteRequest}
                loading={loading}
              />
            )}

            {currentPage === "create-task" && (
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold text-slate-800">Add Target Specification</h3>
                </div>
                <TaskForm
                  onSubmit={handleCreateTaskSubmit}
                  onCancel={() => setCurrentPage("dashboard")}
                  loading={loading}
                />
              </div>
            )}

            {currentPage === "edit-task" && (
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold text-slate-800">Update Specifications</h3>
                </div>
                {activeTaskObj ? (
                  <TaskForm
                    initialTask={activeTaskObj}
                    onSubmit={handleEditTaskSubmit}
                    onCancel={() => {
                      setCurrentPage("dashboard");
                      setSelectedTaskId(null);
                    }}
                    loading={loading}
                  />
                ) : (
                  <div className="text-center rounded-xl border border-slate-200 p-8">Task parameters not found.</div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Elegant State Confirmation Modal for Deletion instead of native alerts */}
      {deleteModalTaskId !== null && (
        <div id="delete-confirmation-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-205 bg-white p-6 shadow-xl animate-scale-up text-left">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4 border border-red-100">
              <Trash2 size={20} />
            </div>
            <h4 className="font-display text-base font-extrabold text-slate-800">Delete Task Specifications?</h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Removing this milestone is irreversible. All documentation and pipeline states related to this task will be permanently deleted from servers.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteModalTaskId(null)}
                className="rounded-lg border border-slate-205 bg-white px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel, Retain
              </button>
              <button
                id="modal-confirm-delete"
                onClick={confirmDeleteTaskAndExecute}
                className="rounded-lg bg-red-600 px-4.5 py-2.5 text-xs font-bold text-white hover:bg-red-700 cursor-pointer shadow-sm transition-all"
              >
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
