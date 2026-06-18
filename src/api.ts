/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, User } from "./types";

const API_BASE = "/api";

export function getAuthToken(): string | null {
  return localStorage.getItem("token");
}

export function setAuthToken(token: string) {
  localStorage.setItem("token", token);
}

export function removeAuthToken() {
  localStorage.removeItem("token");
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Authentication failed");
  }

  const data = await res.json();
  setAuthToken(data.token);
  return data;
}

export async function register(name: string, email: string, password: string, role: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create user account");
  }

  const data = await res.json();
  setAuthToken(data.token);
  return data;
}

export async function getMe(): Promise<User> {
  const res = await fetch(`${API_BASE}/me`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    removeAuthToken();
    throw new Error("Invalid session token");
  }

  const data = await res.json();
  return data.user;
}

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/users`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch developers list");
  }

  return res.json();
}

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/tasks`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch task list");
  }

  return res.json();
}

export async function getTaskById(id: string): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch task details");
  }

  return res.json();
}

export async function createTask(taskData: Partial<Task>): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create task");
  }

  return res.json();
}

export async function updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update task");
  }

  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to delete task");
  }
}
