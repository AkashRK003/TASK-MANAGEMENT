/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CheckSquare, User, Mail, Lock, UserCheck } from "lucide-react";

interface RegisterProps {
  onRegisterSuccess: (token: string, user: any) => void;
  onNavigateToLogin: () => void;
  onRegisterAction: (name: string, email: string, password: string, role: string) => Promise<any>;
}

export default function Register({ onRegisterSuccess, onNavigateToLogin, onRegisterAction }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Contributor");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Available roles matching natural internship settings
  const ROLES_LIST = [
    { value: "Project Manager", desc: "Oversees milestones and coordinates assignments" },
    { value: "Senior Developer", desc: "Implements backend features and core algorithms" },
    { value: "Quality Analyst", desc: "Verifies test coverage and security schemas" },
    { value: "Contributor", desc: "Participates in sprints and writes documentation" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError("Please fill in all registering form parameters.");
      return;
    }

    if (password.length < 6) {
      setError("Passwords must be at least 6 characters in length.");
      return;
    }

    setLoading(true);
    try {
      const data = await onRegisterAction(name, email, password, role);
      onRegisterSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Failed to create user account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-7 rounded-2xl border border-slate-205 bg-white p-8 shadow-md">
        {/* Logo panel */}
        <div className="flex flex-col items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
            <CheckSquare size={24} className="font-semibold text-white shrink-0" />
          </div>
          <h2 className="font-display mt-5 text-2xl font-extrabold tracking-tight text-slate-800">
            Create Intern Session
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 select-none">
            Join the team and claim your role-based keys
          </p>
        </div>

        {/* Error Container */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 border border-red-150 text-xs font-semibold text-red-650 animate-[shake_0.4s_ease-in-out]">
            {error}
          </div>
        )}

        <form className="space-y-4 text-left" onSubmit={handleSubmit}>
          {/* Real Full Name input */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-450" htmlFor="register-name">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                <User size={16} />
              </span>
              <input
                id="register-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Liam O'Connor"
                className="w-full rounded-xl border border-slate-250 bg-slate-50/50 pb-3 pl-10 pr-4 pt-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-450" htmlFor="register-email">
              Email Address / ID
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                <Mail size={16} />
              </span>
              <input
                id="register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. liam@example.com"
                className="w-full rounded-xl border border-slate-250 bg-slate-50/50 pb-3 pl-10 pr-4 pt-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-450" htmlFor="register-password">
              Secure Passkey (6+ chars)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                id="register-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-250 bg-slate-50/50 pb-3 pl-10 pr-4 pt-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Role selector dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-450" htmlFor="register-role">
              Active Project Role Select
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                <UserCheck size={16} />
              </span>
              <select
                id="register-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-slate-250 bg-slate-50 pl-10 pr-4 py-3 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
              >
                {ROLES_LIST.map((r, itemIdx) => (
                  <option key={itemIdx} value={r.value}>
                    {r.value}
                  </option>
                ))}
              </select>
            </div>
            <p className="font-mono text-[10px] text-slate-400 leading-normal pl-1 select-all">
              {ROLES_LIST.find((r) => r.value === role)?.desc}
            </p>
          </div>

          {/* Register Action button */}
          <button
            id="register-submit-button"
            type="submit"
            disabled={loading}
            className="group mt-6 relative flex w-full justify-center rounded-xl bg-indigo-650 px-4 py-3.5 text-sm font-bold text-white hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 transition-all shadow-md select-none cursor-pointer"
          >
            {loading ? "Provisioning Profile..." : "Authorize Identity Account"}
          </button>
        </form>

        {/* Back navigation link */}
        <div className="mt-4 pt-2 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Already registered?{" "}
            <button
              id="goto-login-link"
              onClick={onNavigateToLogin}
              className="font-bold text-indigo-650 hover:underline cursor-pointer"
            >
              Sign back in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
