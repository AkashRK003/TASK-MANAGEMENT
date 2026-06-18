/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CheckSquare, Lock, Mail, Terminal, HelpCircle, ShieldCheck } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
  onNavigateToRegister: () => void;
  onLoginAction: (email: string, password: string) => Promise<any>;
}

export default function Login({ onLoginSuccess, onNavigateToRegister, onLoginAction }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Preset demo test credentials for reviewers
  const demoAccounts = [
    { email: "sophia@example.com", pass: "admin123", role: "Admin", label: "Sophia" },
    { email: "liam@example.com", pass: "developer123", role: "Dev", label: "Liam" },
  ];

  const handleDemoFill = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please key in your email and password credentials");
      return;
    }

    setLoading(true);
    try {
      const data = await onLoginAction(email, password);
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Invalid authentication credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-205 bg-white p-8 shadow-md">
        {/* Header Logo */}
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
            <CheckSquare size={28} className="font-semibold text-white shrink-0" />
          </div>
          <h2 className="font-display mt-6 text-2xl font-extrabold tracking-tight text-slate-800">
            TaskHQ Intern Workspace
          </h2>
          <p className="mt-2 text-xs text-slate-400 select-none">
            JWT Role-Based Access Control Session
          </p>
        </div>

        {/* Alerts panel */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 border border-red-150 text-xs font-semibold text-red-650 animate-[shake_0.4s_ease-in-out]">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* Email input */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-450" htmlFor="email-address">
              Email Address / Account ID
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                <Mail size={16} />
              </span>
              <input
                id="email-address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sophia@example.com"
                className="w-full rounded-xl border border-slate-250 bg-slate-50/50 pb-3 pl-10 pr-4 pt-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-450" htmlFor="password">
              Security Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-250 bg-slate-50/50 pb-3 pl-10 pr-4 pt-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Submit Action button */}
          <button
            id="login-submit-button"
            type="submit"
            disabled={loading}
            className="group mt-4 relative flex w-full justify-center rounded-xl bg-indigo-650 px-4 py-3.5 text-sm font-bold text-white hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 transition-all shadow-md select-none cursor-pointer"
          >
            {loading ? "Decrypting Session..." : "Secure Login Verification"}
          </button>
        </form>

        {/* Demo Fast Fill Section */}
        <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-150 text-left">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold mb-2">
            <Terminal size={12} className="text-indigo-500 shrink-0" />
            <span className="font-mono text-[10px] uppercase tracking-wider">Demo Accounts Quick Login</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleDemoFill(acc)}
                className="flex flex-col items-start rounded-lg border border-slate-205 bg-white p-2.5 text-left hover:scale-[1.02] hover:border-indigo-400 hover:shadow-2xs transition-all pointer-events-auto cursor-pointer"
              >
                <span className="text-[11px] font-bold text-slate-755 leading-none">
                  {acc.label} ({acc.role})
                </span>
                <span className="font-mono text-[9px] text-slate-400 leading-normal mt-1 truncate max-w-full">
                  {acc.email}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Register navigation link */}
        <div className="mt-4 pt-2 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            No active assignment credential key?{" "}
            <button
              id="goto-register-link"
              onClick={onNavigateToRegister}
              className="font-bold text-indigo-650 hover:underline cursor-pointer"
            >
              Register internship account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
