"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, User, Eye, EyeOff, LogIn } from "lucide-react";
import { GradientButton } from "@/components/ui/GradientButton";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      console.log('✅ Login successful, redirecting to dashboard...');
      
      // Wait a bit for cookies to be set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-black to-black" />
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-4xl font-bold text-gradient">Kitchen of Tech</h1>
          </Link>
          <p className="text-white/60 text-lg">Sign in to your dashboard</p>
        </div>

        {/* Login Form */}
        <div className="glass rounded-2xl p-8 shadow-glass-lg border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-white/80 mb-2 text-sm font-medium">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-white/40" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className={cn(
                    "w-full pl-12 pr-4 py-3 glass rounded-xl text-white",
                    "placeholder:text-white/40",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "transition-all border border-white/10",
                    "hover:border-white/20"
                  )}
                  placeholder="your_username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-white/80 mb-2 text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/40" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={cn(
                    "w-full pl-12 pr-12 py-3 glass rounded-xl text-white",
                    "placeholder:text-white/40",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "transition-all border border-white/10",
                    "hover:border-white/20"
                  )}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white/60 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <GradientButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
              className="mt-6"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Sign In
                </div>
              )}
            </GradientButton>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-white/60 hover:text-white transition-colors text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-white/40 text-sm">
            Don&apos;t have an account? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
