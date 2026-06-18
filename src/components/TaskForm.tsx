/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Task, TaskPriority, TaskStatus, User } from "../types";
import { getUsers } from "../api";
import { ClipboardCopy, Calendar, UserCheck, Hammer, MessageSquareDot, HelpCircle } from "lucide-react";

interface TaskFormProps {
  initialTask?: Partial<Task>;
  onSubmit: (data: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    assignedUserId: string | null;
  }) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function TaskForm({ initialTask, onSubmit, onCancel, loading }: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title || "");
  const [description, setDescription] = useState(initialTask?.description || "");
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status || TaskStatus.PENDING);
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority || TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || "");
  const [assignedUserId, setAssignedUserId] = useState<string>(initialTask?.assignedUserId || "");
  const [usersList, setUsersList] = useState<User[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  // Load team users for task assignment dropdown
  useEffect(() => {
    getUsers()
      .then((data) => {
        setUsersList(data);
      })
      .catch((err) => {
        console.error("Failed to fetch user list for assignment dropdown", err);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!title.trim()) {
      setLocalError("Task title is required");
      return;
    }
    if (!dueDate) {
      setLocalError("Target due date is required");
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate,
      assignedUserId: assignedUserId || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs md:p-8">
      {localError && (
        <div className="rounded-xl bg-red-50 p-4 border border-red-150 text-xs font-semibold text-red-700 animate-pulse">
          {localError}
        </div>
      )}

      {/* Title Field */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5" htmlFor="task-title">
          Task Title <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="task-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Set up FastAPI Database container"
            className="w-full rounded-xl border border-slate-250 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5" htmlFor="task-description">
          Description / Specifications
        </label>
        <textarea
          id="task-description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Outline steps, constraints, and resource pointers..."
          className="w-full rounded-xl border border-slate-250 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
        />
      </div>

      {/* Grid Settings */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Priority Dropdown */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5" htmlFor="task-priority">
            Priority Level
          </label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="w-full rounded-xl border border-slate-250 bg-slate-50 px-3.5 py-3 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
          >
            {Object.values(TaskPriority).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5" htmlFor="task-status">
            Task Status
          </label>
          <select
            id="task-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full rounded-xl border border-slate-250 bg-slate-50 px-3.5 py-3 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
          >
            {Object.values(TaskStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5" htmlFor="task-due-date">
            Due Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="task-due-date"
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-250 bg-slate-50 px-3.5 py-3 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Assign User Dropdown */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5" htmlFor="task-assignee">
            Assigned User
          </label>
          <select
            id="task-assignee"
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
            className="w-full rounded-xl border border-slate-250 bg-slate-50 px-3.5 py-3 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
          >
            <option value="">Unassigned (Null)</option>
            {usersList.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Button Row */}
      <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-slate-205 px-5 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>
        <button
          id="task-submit-button"
          type="submit"
          disabled={loading}
          className="rounded-xl bg-indigo-650 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Synchronizing...</span>
            </>
          ) : (
            <span>Save Task Details</span>
          )}
        </button>
      </div>
    </form>
  );
}
