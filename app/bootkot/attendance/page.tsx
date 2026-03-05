'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Search,
  CheckCircle2,
  User,
  BookOpen,
  CalendarCheck,
  Clock,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Participant {
  id: string;
  name: string;
  bootcampId: string;
  bootcampName: string;
  phoneNumber: string;
  status: string;
}

type Stage =
  | 'search'           // Phone input
  | 'loading'          // Fetching from API
  | 'found'            // Participant found — show hold button
  | 'already_done'     // Already attended today
  | 'submitting'       // Hold completed, POST in flight
  | 'confirmed'        // Attendance recorded
  | 'not_found'        // No registration for this phone
  | 'error';           // API error

// ─── Constants ────────────────────────────────────────────────────────────────

const HOLD_DURATION_MS = 3000;
const TICK_MS = 16; // ~60 fps

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayLabel() {
  return new Date().toLocaleDateString('en-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Hold Button ─────────────────────────────────────────────────────────────

interface HoldButtonProps {
  onComplete: () => void;
  disabled?: boolean;
}

function HoldButton({ onComplete, disabled }: HoldButtonProps) {
  const [progress, setProgress] = useState(0); // 0–100
  const [holding, setHolding] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const startHold = useCallback(() => {
    if (disabled || completedRef.current) return;
    setHolding(true);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - (startTimeRef.current ?? Date.now());
      const pct = Math.min((elapsed / HOLD_DURATION_MS) * 100, 100);
      setProgress(pct);

      if (pct >= 100 && !completedRef.current) {
        completedRef.current = true;
        clearInterval(intervalRef.current!);
        setHolding(false);
        onComplete();
      }
    }, TICK_MS);
  }, [disabled, onComplete]);

  const stopHold = useCallback(() => {
    if (completedRef.current) return;
    clearInterval(intervalRef.current!);
    setHolding(false);
    // Spring back to 0
    setProgress(0);
  }, []);

  // Clean up on unmount
  useEffect(() => () => clearInterval(intervalRef.current!), []);

  const circumference = 2 * Math.PI * 54; // r=54
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Outer glow ring + SVG progress */}
      <div className="relative">
        {/* Pulsing glow when holding */}
        {holding && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(34,197,94,0.4) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}

        {/* SVG ring */}
        <svg width="140" height="140" className="rotate-[-90deg]">
          {/* Track */}
          <circle
            cx="70" cy="70" r="54"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
          />
          {/* Progress arc */}
          <motion.circle
            cx="70" cy="70" r="54"
            fill="none"
            stroke="url(#holdGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.016s linear' }}
          />
          <defs>
            <linearGradient id="holdGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>
        </svg>

        {/* Inner button */}
        <motion.button
          onMouseDown={startHold}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={startHold}
          onTouchEnd={stopHold}
          onTouchCancel={stopHold}
          disabled={disabled}
          className="absolute inset-0 m-auto w-[108px] h-[108px] rounded-full flex flex-col items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          style={{
            background: holding
              ? 'linear-gradient(135deg, #16a34a, #15803d)'
              : 'linear-gradient(135deg, #22c55e, #16a34a)',
            boxShadow: holding
              ? '0 0 32px rgba(34,197,94,0.6), inset 0 0 12px rgba(255,255,255,0.1)'
              : '0 0 16px rgba(34,197,94,0.3)',
          }}
          whileTap={{ scale: 0.96 }}
          animate={holding ? { scale: [1, 0.97, 1] } : { scale: 1 }}
          transition={{ duration: 0.4, repeat: holding ? Infinity : 0 }}
        >
          <ShieldCheck className="w-8 h-8 text-white" strokeWidth={1.5} />
          <span className="text-[10px] font-bold text-white/90 tracking-wide uppercase">
            {holding ? `${Math.round(progress)}%` : 'Hold'}
          </span>
        </motion.button>
      </div>

      <p className="text-sm text-white/50 text-center max-w-[220px]">
        {holding
          ? 'Keep holding…'
          : 'Press and hold for 3 seconds to mark attendance'}
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const [phone, setPhone] = useState('');
  const [stage, setStage] = useState<Stage>('search');
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [attendedAt, setAttendedAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedName, setConfirmedName] = useState('');
  const [confirmedBootcamp, setConfirmedBootcamp] = useState('');

  // ── Search ──────────────────────────────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 6) return;

    setStage('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`/api/bootcamp/attendance?phone=${encodeURIComponent(cleaned)}`);
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.');
        setStage('error');
        return;
      }

      if (!data.found) {
        setStage('not_found');
        return;
      }

      setParticipant(data.participant);

      if (data.attendedToday) {
        setAttendedAt(data.attendedAt);
        setStage('already_done');
      } else {
        setStage('found');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStage('error');
    }
  }, [phone]);

  // ── Mark Attendance ─────────────────────────────────────────────────────────
  const handleHoldComplete = useCallback(async () => {
    if (!participant) return;
    setStage('submitting');

    try {
      const res = await fetch('/api/bootcamp/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: participant.phoneNumber }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setStage('already_done');
        } else {
          setErrorMsg(data.error ?? 'Failed to record attendance.');
          setStage('error');
        }
        return;
      }

      setConfirmedName(data.participant.name);
      setConfirmedBootcamp(data.participant.bootcampName);
      setStage('confirmed');
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStage('error');
    }
  }, [participant]);

  // ── Reset ───────────────────────────────────────────────────────────────────
  const reset = () => {
    setPhone('');
    setParticipant(null);
    setAttendedAt(null);
    setErrorMsg('');
    setConfirmedName('');
    setConfirmedBootcamp('');
    setStage('search');
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4 py-16">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      {/* Card */}
      <motion.div
        layout
        className="relative z-10 w-full max-w-md"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 shadow-lg shadow-emerald-500/30 mb-4">
            <CalendarCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Attendance</h1>
          <p className="text-white/50 text-sm">{todayLabel()}</p>
        </div>

        <AnimatePresence mode="wait">

          {/* ── SEARCH STAGE ─────────────────────────────────────────────── */}
          {stage === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">
                  Your registered phone number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="tel"
                    placeholder="e.g. 01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/40 transition-all text-lg tracking-wider"
                    autoFocus
                  />
                </div>
              </div>

              <motion.button
                onClick={handleSearch}
                disabled={phone.replace(/\s/g, '').length < 6}
                className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 0 20px rgba(16,185,129,0.3)',
                }}
                whileHover={{ scale: 1.02, boxShadow: '0 0 28px rgba(16,185,129,0.5)' }}
                whileTap={{ scale: 0.98 }}
              >
                <Search className="w-5 h-5" />
                Search
              </motion.button>
            </motion.div>
          )}

          {/* ── LOADING ──────────────────────────────────────────────────── */}
          {stage === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 flex flex-col items-center gap-4"
            >
              <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
              <p className="text-white/60">Looking up your registration…</p>
            </motion.div>
          )}

          {/* ── NOT FOUND ────────────────────────────────────────────────── */}
          {stage === 'not_found' && (
            <motion.div
              key="not_found"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-white/5 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 space-y-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                <Phone className="w-8 h-8 text-red-400" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">Not Registered</h2>
                <p className="text-white/50 text-sm">
                  No bootcamp registration found for{' '}
                  <span className="text-white font-mono">{phone}</span>.
                  <br />Please check your number or contact the organizer.
                </p>
              </div>
              <button
                onClick={reset}
                className="text-sm text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
              >
                Try a different number
              </button>
            </motion.div>
          )}

          {/* ── FOUND — Hold Button ───────────────────────────────────────── */}
          {stage === 'found' && participant && (
            <motion.div
              key="found"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-8"
            >
              {/* Participant Info */}
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{participant.name}</p>
                  <p className="text-sm text-white/50 flex items-center gap-1.5 truncate">
                    <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                    {participant.bootcampName}
                  </p>
                  <span
                    className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      participant.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {participant.status}
                  </span>
                </div>
              </div>

              {/* Hold Button */}
              <div className="flex flex-col items-center gap-2">
                <HoldButton onComplete={handleHoldComplete} />
              </div>

              <button
                onClick={reset}
                className="w-full text-center text-xs text-white/30 hover:text-white/50 transition-colors"
              >
                ← Search again
              </button>
            </motion.div>
          )}

          {/* ── SUBMITTING ───────────────────────────────────────────────── */}
          {stage === 'submitting' && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 flex flex-col items-center gap-4"
            >
              <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
              <p className="text-white/60">Recording your attendance…</p>
            </motion.div>
          )}

          {/* ── CONFIRMED ────────────────────────────────────────────────── */}
          {stage === 'confirmed' && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="bg-white/5 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-8 space-y-6 text-center"
            >
              {/* Animated checkmark */}
              <motion.div
                className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/40"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 18 }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={1.5} />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <h2 className="text-2xl font-bold text-white">Present! 🎉</h2>
                <p className="text-white/70">
                  <span className="text-white font-semibold">{confirmedName}</span>
                  &apos;s attendance has been marked.
                </p>
                <p className="text-sm text-white/40 flex items-center justify-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  {confirmedBootcamp}
                </p>
                <p className="text-sm text-white/40 flex items-center justify-center gap-1.5 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}
                  {' · '}
                  {todayLabel()}
                </p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={reset}
                className="mt-4 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-sm font-medium transition-all"
              >
                Mark another attendance
              </motion.button>
            </motion.div>
          )}

          {/* ── ALREADY DONE ─────────────────────────────────────────────── */}
          {stage === 'already_done' && (
            <motion.div
              key="already_done"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-white/5 backdrop-blur-xl border border-yellow-500/20 rounded-3xl p-8 space-y-6 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto">
                <CalendarCheck className="w-10 h-10 text-yellow-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Already Marked</h2>
                <p className="text-white/60 text-sm">
                  {participant?.name
                    ? <><span className="text-white font-semibold">{participant.name}</span>, you&apos;ve</>
                    : "You've"}{' '}
                  already marked attendance today.
                </p>
                {attendedAt && (
                  <p className="text-xs text-white/40 flex items-center justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Marked at{' '}
                    {new Date(attendedAt).toLocaleTimeString('en-BD', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
              <button
                onClick={reset}
                className="text-sm text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
              >
                ← Search again
              </button>
            </motion.div>
          )}

          {/* ── ERROR ────────────────────────────────────────────────────── */}
          {stage === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-white/5 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 space-y-6 text-center"
            >
              <p className="text-red-400">{errorMsg}</p>
              <button
                onClick={reset}
                className="text-sm text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
              >
                Try again
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <p className="relative z-10 mt-10 text-white/20 text-xs text-center">
        BootKot Bootcamp · Kitchen of Tech
      </p>
    </div>
  );
}
