/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Task, TaskPriority, TaskStatus, DashboardStats } from "../types";
import DashboardStatsPanel from "../components/DashboardStats";
import TaskCard from "../components/TaskCard";
import { Search, ListFilter, PlusCircle, LayoutGrid, AlertCircle, RefreshCw, X } from "lucide-react";

interface DashboardProps {
  tasks: Task[];
  onViewDetails: (id: string) => void;
  onEditTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onNavigateToCreate: () => void;
  loading: boolean;
  onRefresh: () => void;
}

export default function Dashboard({
  tasks,
  onViewDetails,
  onEditTask,
  onDeleteTask,
  onNavigateToCreate,
  loading,
  onRefresh,
}: DashboardProps) {
  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("dueDateAsc");

  // Calculate Aggregations
  const todayStr = new Date().toISOString().split("T")[0];

  const stats: DashboardStats = {
    totalCount: tasks.length,
    completedCount: tasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
    pendingCount: tasks.filter((t) => t.status === TaskStatus.PENDING).length,
    inProgressCount: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
    overdueCount: tasks.filter((t) => t.status !== TaskStatus.COMPLETED && t.dueDate < todayStr).length,
  };

  // Run Search, Filters and Sorting in memory
  const getFilteredTasks = () => {
    let result = [...tasks];

    // Search filter
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.assignedUser?.name.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "All") {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Sort configurations
    result.sort((a, b) => {
      if (sortBy === "dueDateAsc") {
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortBy === "dueDateDesc") {
        return b.dueDate.localeCompare(a.dueDate);
      }
      if (sortBy === "priorityHighToLow") {
        const priorityOrder = { [TaskPriority.HIGH]: 3, [TaskPriority.MEDIUM]: 2, [TaskPriority.LOW]: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      }
      if (sortBy === "createdDesc") {
        return b.createdAt.localeCompare(a.createdAt);
      }
      return 0;
    });

    return result;
  };

  const filteredTasks = getFilteredTasks();

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setSortBy("dueDateAsc");
  };

  return (
    <div className="space-y-6">
      {/* Top action header info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-800">Workspace Dashboard</h2>
          <p className="text-xs text-slate-400 select-none">Monitor development pipeline sprints in real time.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh action */}
          <button
            onClick={onRefresh}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-205 bg-white text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh pipeline tasks manually"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-indigo-600" : ""} />
          </button>

          {/* Create Task Button */}
          <button
            id="create-task-primary-button"
            onClick={onNavigateToCreate}
            className="flex h-10 items-center gap-2 rounded-xl bg-indigo-650 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Aggregate Stats Dashboard */}
      <DashboardStatsPanel stats={stats} />

      {/* Filters, search and sort toolbar panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search bar input */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-450 pointer-events-none">
              <Search size={16} />
            </span>
            <input
              id="task-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, specs, or designer..."
              className="w-full rounded-lg border border-slate-205 bg-slate-50/50 pb-2 pl-10 pr-4 pt-2 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-400 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Select inputs parameters row */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:w-3/5">
            {/* Status Select */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 bg-slate-50/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">Status</span>
              <select
                id="status-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-transparent border-none outline-hidden text-xs font-bold text-slate-700 focus:ring-0"
              >
                <option value="All">All statuses</option>
                {Object.values(TaskStatus).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Select */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 bg-slate-50/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">Priority</span>
              <select
                id="priority-filter-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full bg-transparent border-none outline-hidden text-xs font-bold text-slate-700 focus:ring-0"
              >
                <option value="All">All priorities</option>
                {Object.values(TaskPriority).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 bg-slate-50/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">Sort</span>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-transparent border-none outline-hidden text-xs font-bold text-slate-700 focus:ring-0"
              >
                <option value="dueDateAsc">Milestone Asc</option>
                <option value="dueDateDesc">Milestone Desc</option>
                <option value="priorityHighToLow">Priority H → L</option>
                <option value="createdDesc">Created Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clear active filters label row */}
        {(searchTerm || statusFilter !== "All" || priorityFilter !== "All" || sortBy !== "dueDateAsc") && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-400 select-none">
            <span>Filtering out {filteredTasks.length} matching tasks</span>
            <button
              onClick={resetFilters}
              className="font-bold text-indigo-650 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Clear filters reset
            </button>
          </div>
        )}
      </div>

      {/* Main task list container */}
      {loading && filteredTasks.length === 0 ? (
        <div id="dashboard-loading-skeleton" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="h-44 w-full animate-pulse rounded-xl border border-slate-200 bg-slate-100/30" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div
          id="dashboard-empty-state"
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-14 px-6 text-center shadow-xs"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <LayoutGrid size={24} />
          </div>
          <h3 className="font-display mt-4 text-base font-bold text-slate-700">No tasks matched your query</h3>
          <p className="mt-1.5 text-xs text-slate-400 max-w-sm">
            Adjust search keywords or build your first task element to initiate progress pipelines.
          </p>
          <button
            onClick={onNavigateToCreate}
            className="mt-5 rounded-xl bg-indigo-650 px-4.5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            Create your first task now
          </button>
        </div>
      ) : (
        <div id="tasks-bento-grid" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onViewDetails={onViewDetails}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
