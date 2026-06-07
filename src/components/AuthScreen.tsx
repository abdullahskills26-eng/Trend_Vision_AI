import React, { useState } from "react";
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { login as apiLogin, register as apiRegister } from "../services/api";
import type { ThemeName } from "../types";

interface AuthProps {
  onAuthSuccess: (token: string, user: any) => void;
  theme: ThemeName;
}

export default function AuthScreen({ onAuthSuccess, theme }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Quick-login demo helper
  const handleQuickDemo = () => {
    setEmail("jannatchohan821@gmail.com");
    setUsername("Trendexplorer");
    setPassword("password123");
    setIsLogin(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password || (!isLogin && !username)) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (!isLogin && password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const data = isLogin 
        ? await apiLogin(email, password)
        : await apiRegister(username, email, password);

      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`theme-${theme} min-h-screen flex flex-col justify-center items-center px-4 transition-all duration-300 bg-[var(--bg-base)] text-[var(--text-primary)]`}>
      {/* Decorative Blur Spheres for UI Depth */}
      {theme !== "light" && (
        <>
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-[var(--color-brand-primary)]/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[var(--color-brand-secondary)]/10 blur-[100px] pointer-events-none" />
        </>
      )}

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium mb-3 bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] border border-[var(--color-brand-primary)]/10">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            Empowered by Gemini AI Grounding
          </div>
          <h1 className="text-4xl font-sans font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--color-brand-primary)] drop-shadow-xl pb-1">
            TrendVision AI
          </h1>
          <p className="text-sm mt-2 text-[var(--text-secondary)] max-w-sm mx-auto">
            Deep predictive logic and automated data analytics for futuristic innovators.
          </p>
        </div>

        <div className="rounded-2xl p-8 bg-[var(--bg-surface)] border border-[var(--bg-border)] shadow-2xl backdrop-blur-md">
            <div className="flex bg-[var(--bg-elevated)] p-1.5 rounded-xl mb-6 border border-[var(--bg-border)]">
            <button
              onClick={() => { setIsLogin(true); setError(""); }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                isLogin 
                  ? "bg-[var(--color-brand-primary)] text-white shadow-sm" 
                  : "text-(--text-muted) hover:text-[var(--text-primary)]"
              }`}
            >
              Sign In Account
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(""); }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                !isLogin 
                  ? "bg-[var(--color-brand-primary)] text-white shadow-sm" 
                  : "text-(--text-muted) hover:text-[var(--text-primary)]"
              }`}
            >
              Register Portal
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                {error}
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 font-mono uppercase tracking-wide">
                  Account Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-(--text-muted)" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter analytical username"
                    className="w-full bg-(--bg-elevated) border border-(--bg-border) rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-(--color-brand-primary) text-(--text-primary) transition placeholder-(--text-muted)"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 font-mono uppercase tracking-wide">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-brand-primary)] text-[var(--text-primary)] transition placeholder-[var(--text-muted)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 font-mono uppercase tracking-wide">
                Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-brand-primary)] text-[var(--text-primary)] transition placeholder-[var(--text-muted)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-[var(--color-brand-primary)] hover:brightness-110 text-white font-medium text-sm py-3 px-4 rounded-xl shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Decrypt Diagnostics" : "Instantiate Credentials"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Credentials Badge */}
          <div className="mt-6 pt-5 border-t border-[var(--bg-border)] flex flex-col items-center">
            <span className="text-[10px] text-[var(--text-muted)] font-mono tracking-wider uppercase mb-2">
              Development Debug Option
            </span>
            <button
              type="button"
              onClick={handleQuickDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Use Quick Demo (One-Click)
            </button>
          </div>
        </div>
        
        <div className="text-center mt-6 text-xs text-[var(--text-muted)] font-mono">
          TrendVision Diagnostics Platform • Standard UTC Time Model
        </div>
      </div>
    </div>
  );
}
