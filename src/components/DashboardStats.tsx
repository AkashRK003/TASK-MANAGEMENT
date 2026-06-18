/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DashboardStats } from "../types";
import { CheckCircle2, Clock, Hourglass, Layers, AlertTriangle } from "lucide-react";

interface DashboardStatsProps {
  stats: DashboardStats;
}

export default function DashboardStatsPanel({ stats }: DashboardStatsProps) {
  const completedRate = stats.totalCount > 0 
    ? Math.round((stats.completedCount / stats.totalCount) * 100) 
    : 0;

  const statCards = [
    {
      id: "stats-total",
      label: "Pipeline Backlog",
      value: stats.totalCount,
      icon: Layers,
      colorClass: "text-indigo-600 bg-indigo-50 border-indigo-100",
      accentBg: "from-indigo-500/5 to-indigo-500/0",
      description: "Total team task records logged",
    },
    {
      id: "stats-completed",
      label: "Velocity Completed",
      value: `${stats.completedCount} / ${stats.totalCount}`,
      icon: CheckCircle2,
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
      accentBg: "from-emerald-500/5 to-emerald-500/0",
      description: `${completedRate}% completion velocity`,
    },
    {
      id: "stats-pending",
      label: "In Progress / Pending",
      value: stats.inProgressCount + stats.pendingCount,
      icon: Hourglass,
      colorClass: "text-sky-600 bg-sky-50 border-sky-100",
      accentBg: "from-sky-500/5 to-sky-500/0",
      description: `${stats.inProgressCount} active, ${stats.pendingCount} queued`,
    },
    {
      id: "stats-overdue",
      label: "At-Risk Overdue",
      value: stats.overdueCount,
      icon: AlertTriangle,
      colorClass: stats.overdueCount > 0 
        ? "text-rose-600 bg-rose-50 border-rose-200 animate-pulse" 
        : "text-slate-500 bg-slate-50 border-slate-150",
      accentBg: stats.overdueCount > 0 ? "from-rose-500/5 to-rose-500/0" : "from-slate-500/5 to-slate-500/0",
      description: stats.overdueCount > 0 
        ? "Requires immediate attention" 
        : "All benchmarks on-schedule",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            id={card.id}
            key={card.id}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-md hover:border-indigo-200`}
          >
            {/* Ambient Background Gradient for Premium Layout Sizing */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.accentBg} pointer-events-none`} />

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 select-none">{card.label}</p>
                <h3 className="font-display mt-1.5 text-2xl font-extrabold tracking-tight text-slate-800">
                  {card.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl border ${card.colorClass} transition-transform duration-300 group-hover:scale-110`}>
                <Icon size={20} />
              </div>
            </div>

            {/* Sub-info description */}
            <div className="relative z-10 mt-4 border-t border-slate-100 pt-3">
              <span className="text-[11px] font-medium text-slate-500 font-mono tracking-tight">
                {card.description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

