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
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupStep, setSignupStep] = useState<'options' | 'team_member'>('options');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [teamMemberForm, setTeamMemberForm] = useState({
    full_name: '',
    username: '',
    email: '',
    phone_number: '',
    password: '',
  });

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

  const handleTeamMemberSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccess('');
    setSignupLoading(true);

    try {
      const response = await fetch('/api/signup/team-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamMemberForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setSignupSuccess(data.message || 'Signup request submitted.');
  setTeamMemberForm({ full_name: '', username: '', email: '', phone_number: '', password: '' });
    } catch (err) {
      setSignupError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setSignupLoading(false);
    }
  };

  const closeSignupModal = () => {
    setShowSignupModal(false);
    setSignupStep('options');
    setSignupError('');
    setSignupSuccess('');
  setTeamMemberForm({ full_name: '', username: '', email: '', phone_number: '', password: '' });
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

            {/* Username/Email Field */}
            <div>
              <label htmlFor="username" className="block text-white/80 mb-2 text-sm font-medium">
                Username or Email
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
                  placeholder="username or email"
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

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowSignupModal(true)}
              className="text-white/70 hover:text-white transition-colors text-sm"
            >
              Don&apos;t have an account? Sign Up
            </button>
          </div>

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

      {showSignupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="glass w-full max-w-lg rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Sign Up</h2>
              <button
                type="button"
                onClick={closeSignupModal}
                className="rounded-lg p-2 text-white/60 hover:text-white"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>

            {signupStep === 'options' && (
              <div className="mt-6 grid gap-4">
                {[
                  { key: 'student', label: 'Student', disabled: true },
                  { key: 'teacher', label: 'Teacher', disabled: true },
                  { key: 'client', label: 'Client', disabled: true },
                  { key: 'team_member', label: 'Team Member', disabled: false },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => !option.disabled && setSignupStep('team_member')}
                    className={cn(
                      'rounded-xl border border-white/10 px-4 py-3 text-left transition-colors',
                      option.disabled
                        ? 'text-white/40 cursor-not-allowed bg-white/5'
                        : 'text-white hover:border-white/30 hover:bg-white/10'
                    )}
                  >
                    <div className="text-sm font-semibold">{option.label}</div>
                    <div className="text-xs text-white/50">
                      {option.disabled ? 'Coming soon' : 'Request team member access'}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {signupStep === 'team_member' && (
              <form onSubmit={handleTeamMemberSignup} className="mt-6 space-y-4">
                {signupError && (
                  <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">
                    {signupError}
                  </div>
                )}
                {signupSuccess && (
                  <div className="rounded-xl border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-300">
                    {signupSuccess}
                  </div>
                )}
                <div>
                  <label className="block text-white/80 text-sm mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={teamMemberForm.full_name}
                    onChange={(e) => setTeamMemberForm({ ...teamMemberForm, full_name: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-2">Username</label>
                  <input
                    type="text"
                    required
                    value={teamMemberForm.username}
                    onChange={(e) => setTeamMemberForm({ ...teamMemberForm, username: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                    placeholder="Username"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={teamMemberForm.email}
                    onChange={(e) => setTeamMemberForm({ ...teamMemberForm, email: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={teamMemberForm.phone_number}
                    onChange={(e) => setTeamMemberForm({ ...teamMemberForm, phone_number: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={teamMemberForm.password}
                      onChange={(e) => setTeamMemberForm({ ...teamMemberForm, password: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-white/60"
                    >
                      {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSignupStep('options')}
                    className="flex-1 rounded-xl border border-white/10 px-4 py-2 text-white/70"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={signupLoading}
                    className="flex-1 rounded-xl bg-gradient-primary px-4 py-2 text-white"
                  >
                    {signupLoading ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
