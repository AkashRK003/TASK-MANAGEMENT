/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, TaskPriority, TaskStatus } from "../types";
import { Calendar, User, ArrowUpRight, Flame, ShieldAlert, Pencil, Trash2, Tag, CheckSquare } from "lucide-react";

interface TaskCardProps {
  key?: string;
  task: Task;
  onViewDetails: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onViewDetails, onEdit, onDelete }: TaskCardProps) {
  // Check if task is overdue
  const todayStr = new Date().toISOString().split("T")[0];
  const isOverdue = task.status !== TaskStatus.COMPLETED && task.dueDate < todayStr;

  const priorityColors = {
    [TaskPriority.LOW]: { bg: "bg-emerald-50/70 border-emerald-100", text: "text-emerald-700", iconColor: "text-emerald-500" },
    [TaskPriority.MEDIUM]: { bg: "bg-indigo-50/70 border-indigo-100", text: "text-indigo-700", iconColor: "text-indigo-500" },
    [TaskPriority.HIGH]: { bg: "bg-rose-50/70 border-rose-100", text: "text-rose-700", iconColor: "text-rose-500" },
  };

  const statusColors = {
    [TaskStatus.PENDING]: { border: "border-l-slate-400", dot: "bg-slate-400", bg: "bg-slate-50 text-slate-700" },
    [TaskStatus.IN_PROGRESS]: { border: "border-l-amber-500", dot: "bg-amber-500", bg: "bg-amber-50 text-amber-800" },
    [TaskStatus.COMPLETED]: { border: "border-l-emerald-500", dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-800" },
  };

  return (
    <div
      id={`task-card-${task.id}`}
      className={`group relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white/90 p-5 shadow-sm backdrop-blur-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-200 border-l-4 ${
        statusColors[task.status]?.border || "border-l-slate-200"
      }`}
    >
      {/* Upper Section */}
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-3 flex-wrap">
          {/* Priority */}
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              priorityColors[task.priority]?.bg
            } ${priorityColors[task.priority]?.text}`}
          >
            <Flame size={11} className={priorityColors[task.priority]?.iconColor} />
            {task.priority}
          </span>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              statusColors[task.status]?.bg
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusColors[task.status]?.dot}`} />
            <span className="text-[11px] font-bold uppercase tracking-wider">{task.status}</span>
          </span>
        </div>

        {/* Title */}
        <h4 className="font-display font-bold text-slate-800 text-[15px] leading-snug group-hover:text-indigo-600 transition-colors">
          {task.title}
        </h4>

        {/* Description */}
        <p className="mt-2 text-xs leading-relaxed text-slate-400 line-clamp-2 h-8">
          {task.description || "No task specification detail logged."}
        </p>
      </div>

      {/* Middle Line / Due Date / User info */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col gap-3">
        {/* Due Date & Overdue Tag */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar size={13} className="text-slate-400" />
            <span className="text-xs font-semibold font-mono text-slate-600">{task.dueDate}</span>
          </div>

          {isOverdue ? (
            <span className="animate-pulse inline-flex items-center gap-1 rounded bg-rose-50 border border-rose-100 px-2 py-0.5 text-[9px] font-extrabold text-rose-700 uppercase tracking-widest">
              <ShieldAlert size={10} />
              Overdue
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono">
              <Tag size={10} />
              ID: {task.id.substring(0, 4)}
            </span>
          )}
        </div>

        {/* Assigned User info */}
        <div className="flex items-center gap-2 bg-slate-50/50 rounded-lg p-1.5 border border-slate-100">
          {task.assignedUser ? (
            <>
              <img
                src={task.assignedUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces"}
                alt={task.assignedUser.name}
                className="h-6 w-6 rounded-full object-cover border border-white ring-2 ring-slate-200/50"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-600 truncate" title={task.assignedUser.name}>
                  {task.assignedUser.name}
                </span>
                <span className="text-[10px] text-slate-400 capitalize font-medium">{task.assignedUser.role}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400 py-0.5 pl-1">
              <User size={13} className="text-slate-350" />
              <span className="text-xs font-medium text-slate-400/80 italic">Unassigned pipeline</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions Panel */}
      <div className="mt-3.5 flex items-center justify-end gap-1.5 border-t border-slate-50 pt-3 opacity-90 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-250">
        <button
          onClick={() => onViewDetails(task.id)}
          className="flex h-7 px-2.5 items-center gap-1 rounded bg-slate-50 text-[11px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 transition-colors cursor-pointer"
          title="See detailed specification"
        >
          Details
        </button>
        <button
          onClick={() => onEdit(task.id)}
          className="flex h-7 w-7 items-center justify-center rounded bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100/55 transition-colors cursor-pointer"
          title="Edit parameters"
        >
          <Pencil size={11} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="flex h-7 w-7 items-center justify-center rounded bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100/55 transition-colors cursor-pointer"
          title="Delete task"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

