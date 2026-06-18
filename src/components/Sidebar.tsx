/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckSquare, LayoutDashboard, PlusCircle, ShieldAlert, Sparkles, LogOut, Terminal } from "lucide-react";
import { User } from "../types";

interface SidebarProps {
  user: User | null;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ user, currentPage, onNavigate, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Task Dashboard", icon: LayoutDashboard },
    { id: "create-task", label: "Create New Task", icon: PlusCircle },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-900 text-slate-100 shrink-0">
      {/* Brand Logo Header */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
          <CheckSquare size={20} className="font-bold text-white shrink-0" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold leading-tight tracking-wide text-white text-base">TaskHQ</span>
          <span className="font-mono text-[9px] font-semibold text-indigo-400 uppercase tracking-widest leading-none">Developer Internship</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || (item.id === "dashboard" && (currentPage === "edit-task" || currentPage === "task-details"));
          return (
            <button
              id={`nav-link-${item.id}`}
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? "bg-slate-800 text-white font-semibold border-l-4 border-indigo-500 rounded-l-none"
                  : "text-slate-400 hover:bg-slate-850 hover:text-slate-100"
              }`}
            >
              <Icon size={18} className={isActive ? "text-indigo-400" : "text-slate-400"} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Technical Metadata info section */}
      <div className="mx-4 mb-4 rounded-xl bg-slate-850 p-4 border border-slate-800/80">
        <div className="flex items-center gap-2 text-indigo-400 mb-1.5">
          <Terminal size={14} className="shrink-0" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider">FastAPI Reference</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          The production Python FastAPI directory model code can be viewed inside <code className="text-white bg-slate-800 font-mono text-[9px] px-1 rounded-sm select-all">/backend-python</code>. Complete with SQLAlchemy, PostgreSQL setup, Pydantic, and native WebSockets.
        </p>
      </div>

      {/* Footer Profile Details */}
      {user && (
        <div className="flex flex-col p-4 border-t border-slate-800 bg-slate-950/20">
          <div className="flex items-center gap-3">
            <img
              src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces"}
              alt={user.name}
              className="h-9 w-9 rounded-full object-cover border border-slate-800 shadow-2xs"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate leading-none mb-1">{user.name}</p>
              <span className="inline-block rounded-full bg-slate-800 px-1.5 py-0.5 text-[9px] font-medium text-slate-400">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
