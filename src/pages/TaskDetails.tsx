/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, TaskPriority, TaskStatus } from "../types";
import { ArrowLeft, Edit2, Trash2, Calendar, User, Clock, CheckSquare, ShieldCheck, Flame } from "lucide-react";

interface TaskDetailsProps {
  task: Task | null;
  onBack: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

export default function TaskDetails({ task, onBack, onEdit, onDelete, loading }: TaskDetailsProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-indigo-650" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/20 py-12 px-6 text-center">
        <h3 className="font-display text-base font-bold text-rose-700">Task details spec not found</h3>
        <p className="mt-1 text-xs text-rose-500 max-w-sm">The selected task element may have been removed.</p>
        <button
          onClick={onBack}
          className="mt-5 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-700 cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const priorityColors = {
    [TaskPriority.LOW]: "bg-green-50 text-green-700 border-green-200",
    [TaskPriority.MEDIUM]: "bg-blue-50 text-blue-700 border-blue-200",
    [TaskPriority.HIGH]: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const statusColors = {
    [TaskStatus.PENDING]: "bg-slate-100 text-slate-650",
    [TaskStatus.IN_PROGRESS]: "bg-amber-50 text-amber-800 border-amber-250",
    [TaskStatus.COMPLETED]: "bg-emerald-50 text-emerald-800 border-emerald-250",
  };

  // Human-readable timestamps
  const formatedCreated = new Date(task.createdAt).toLocaleString();
  const formatedUpdated = new Date(task.updatedAt).toLocaleString();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button header row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Edit Button */}
          <button
            onClick={() => onEdit(task.id)}
            className="flex h-9 items-center gap-2 rounded-lg bg-indigo-50 px-4 text-xs font-bold text-indigo-750 hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            <Edit2 size={13} />
            <span>Edit Specs</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(task.id)}
            className="flex h-9 items-center gap-2 rounded-lg bg-rose-50 px-4 text-xs font-bold text-rose-755 hover:bg-rose-100 hover:text-red-755 transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Delete Task</span>
          </button>
        </div>
      </div>

      {/* Task Profile Details Card */}
      <div id="task-details-pane" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-5">
          {/* Title & Priority */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  priorityColors[task.priority]
                }`}
              >
                <Flame size={12} />
                {task.priority} Priority
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  statusColors[task.status]
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {task.status}
              </span>
            </div>

            <h3 className="font-display text-2xl font-extrabold tracking-tight text-slate-800 leading-tight">
              {task.title}
            </h3>
          </div>
        </div>

        {/* Task Description Body */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Specifications / Description</h4>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 whitespace-pre-line bg-slate-50/50 rounded-xl p-4 border border-slate-100">
            {task.description || "No specifications documentation attached to this task."}
          </p>
        </div>

        {/* Details Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 border-t border-slate-100 pt-6">
          {/* Assignee item */}
          <div>
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <User size={13} />
              Assigned User
            </span>
            <div className="mt-2.5 flex items-center gap-2.5">
              {task.assignedUser ? (
                <>
                  <img
                    src={task.assignedUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces"}
                    alt={task.assignedUser.name}
                    className="h-8 w-8 rounded-full object-cover border border-slate-200 shadow-2xs"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-850 leading-none">{task.assignedUser.name}</p>
                    <span className="text-[10px] text-slate-400 font-medium capitalize mt-1 inline-block">
                      {task.assignedUser.role}
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-xs font-medium text-slate-450 italic">Unassigned (None)</span>
              )}
            </div>
          </div>

          {/* Due date item */}
          <div>
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Calendar size={13} />
              Target Due Date
            </span>
            <p className="mt-2 text-sm font-semibold text-slate-800 font-mono">
              {task.dueDate}
            </p>
          </div>

          {/* Created date item */}
          <div>
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Clock size={13} />
              Created Timestamp
            </span>
            <p className="mt-2 text-xs font-semibold text-slate-600 font-mono">
              {formatedCreated}
            </p>
          </div>

          {/* Updated date item */}
          <div>
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Clock size={13} />
              Updated Timestamp
            </span>
            <p className="mt-2 text-xs font-semibold text-slate-600 font-mono">
              {formatedUpdated}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
