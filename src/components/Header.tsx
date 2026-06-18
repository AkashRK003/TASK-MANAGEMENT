/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User } from "../types";
import { LogOut, Wifi, WifiOff, LayoutDashboard, Database, CheckSquare } from "lucide-react";

interface HeaderProps {
  user: User | null;
  wsConnected: boolean;
  onLogout: () => void;
  currentPageTitle: string;
}

export default function Header({ user, wsConnected, onLogout, currentPageTitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/75 backdrop-blur-md px-6 shadow-xs">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-xl font-bold tracking-tight text-slate-800">
          {currentPageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Real-time Indicator Tag */}
        <div
          id="ws-status-indicator"
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold select-none ${
            wsConnected
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
          }`}
        >
          {wsConnected ? (
            <>
              <Wifi size={14} className="text-emerald-500 shrink-0" />
              <span>Real-Time Sync Active</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-amber-500 shrink-0" />
              <span>Syncing...</span>
            </>
          )}
        </div>

        {/* User Card */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <img
              src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces"}
              alt={user.name}
              className="h-9 w-9 rounded-full object-cover border border-slate-200 shadow-2xs"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-700 leading-tight">{user.name}</span>
              <span className="text-xs text-slate-400 capitalize">{user.role}</span>
            </div>

            <button
              id="logout-button"
              onClick={onLogout}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-red-500 transition-colors"
              title="Logout session"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
