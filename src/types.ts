/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum TaskStatus {
  PENDING = "Pending",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
}

export enum TaskPriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  assignedUser?: User;
  assignedUserId?: string;
}

export interface DashboardStats {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  inProgressCount: number;
  overdueCount: number;
}
