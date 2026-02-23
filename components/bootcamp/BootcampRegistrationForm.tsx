'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ExternalLink, Clock, CheckCircle2, XCircle, Loader2, PartyPopper, Users } from 'lucide-react';
import { GradientButton } from '@/components/ui/GradientButton';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Bootcamp } from '@/types';

//  Schema 

const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  occupation: z.string().min(2, 'Occupation is required').max(100),
  institute: z.string().optional(),
  phoneNumber: z
    .string()
    .min(6, 'Phone number must be at least 6 digits')
    .regex(/^[\d+\-\s()]+$/, 'Invalid phone number'),
  whatsappNumber: z
    .string()
    .min(6, 'WhatsApp number must be at least 6 digits')
    .regex(/^[\d+\-\s()]+$/, 'Invalid WhatsApp number'),
  email: z.string().email('Please enter a valid email'),
  interests: z.string().optional(),
  registrationReason: z
    .string()
    .min(20, 'Please write at least 20 characters')
    .max(1000, 'Maximum 1000 characters'),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

//  Countdown Timer -

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function useCountdown(targetDate: string | undefined): TimeLeft | null {
  const calculate = useCallback((): TimeLeft | null => {
    if (!targetDate) return null;
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  }, [targetDate]);

  // Always initialise as null so the server and client render identical HTML.
  // The interval fires immediately (delay 0) on mount to populate the value
  // without a visible 1-second blank, then ticks every second after that.
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const tick = () => setTimeLeft(calculate());
    // Use a timeout of 0 to populate the value on the first client paint
    // without triggering a synchronous setState inside the effect body.
    const immediate = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(immediate);
      clearInterval(timer);
    };
  }, [calculate]);

  return timeLeft;
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center">
        <span className="text-2xl font-bold text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs text-white/50 mt-1 uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ── Congratulations Modal ────────────────────────────────────────────────────

interface CongratsModalProps {
  bootcampName: string;
  facebookGroupUrl?: string;
  onClose: () => void;
}

function CongratsModal({ bootcampName, facebookGroupUrl, onClose }: CongratsModalProps) {
  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="congrats-title"
    >
      <div className="relative w-full max-w-md mx-auto">
        {/* Glow ring */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/60 via-purple-500/40 to-pink-500/40 blur-sm" />

        <div className="relative rounded-2xl bg-[#0d0d1a] border border-white/10 p-8 text-center space-y-6 overflow-hidden">
          {/* Decorative background blobs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Icon */}
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 border border-primary/40 flex items-center justify-center">
              <PartyPopper className="w-9 h-9 text-primary" />
            </div>
            {/* Orbiting checkmark badge */}
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-green-500 border-2 border-[#0d0d1a] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Text */}
          <div className="relative space-y-2">
            <h2 id="congrats-title" className="text-2xl font-extrabold text-white tracking-tight">
              🎉 Congratulations!
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">
              You have successfully registered for{' '}
              <span className="text-primary font-semibold">{bootcampName}</span>!
              We&apos;re thrilled to have you on board.
            </p>
            <p className="text-white/60 text-xs">
              Our team will review your application and reach out to you soon with next steps.
            </p>
          </div>

          {/* Facebook Group CTA — always shown; disabled if URL not yet configured */}
          <div className="relative space-y-3">
            <div className="p-4 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/30">
              <div className="flex items-center gap-2 justify-center mb-2">
                <Users className="w-4 h-4 text-[#1877F2]" />
                <span className="text-[#1877F2] font-semibold text-sm">Join Our Community</span>
              </div>
              <p className="text-white/60 text-xs leading-relaxed">
                Join our official Facebook group to get the latest updates, resources,
                announcements, and connect with fellow participants!
              </p>
            </div>

            {facebookGroupUrl ? (
              <a
                href={facebookGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #1877F2 0%, #0a5dc4 100%)' }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Join Our Facebook Group
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            ) : (
              /* URL not yet set in Sanity — show a clearly labelled placeholder */
              <div
                className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-semibold text-sm text-white/40 border border-white/10 cursor-not-allowed select-none"
                title="Facebook group link not configured yet"
              >
                <svg className="w-5 h-5 opacity-40" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook Group Link Coming Soon
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="relative w-full py-2.5 px-6 rounded-xl text-white/60 text-sm font-medium border border-white/10 hover:border-white/20 hover:text-white/80 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

//  Main Component 

interface BootcampRegistrationFormProps {
  bootcamp: Bootcamp;
}

export default function BootcampRegistrationForm({ bootcamp }: BootcampRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  // facebookGroupUrl from API response — always fresh, not from cached page prop
  const [facebookGroupUrl, setFacebookGroupUrl] = useState<string | null>(
    bootcamp.facebookGroupUrl ?? null
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  // mounted: prevents server/client mismatch on time-dependent rendering
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const openCountdown = useCountdown(bootcamp.registrationOpenDate);
  const closeCountdown = useCountdown(bootcamp.registrationCloseDate);

  //  Registration window logic 
  // Use a stable "now" that only runs on the client (after mount)
  const now = mounted ? Date.now() : 0;
  const openTime = bootcamp.registrationOpenDate
    ? new Date(bootcamp.registrationOpenDate).getTime()
    : null;
  const closeTime = bootcamp.registrationCloseDate
    ? new Date(bootcamp.registrationCloseDate).getTime()
    : null;
  const deadlineTime = bootcamp.registrationDeadline
    ? new Date(bootcamp.registrationDeadline).getTime()
    : null;

  // When not yet mounted (SSR), treat as neither open nor closed so the
  // form renders a neutral skeleton — avoids hydration mismatch entirely.
  const notOpenYet = mounted && openTime !== null && now < openTime;
  const isClosed =
    mounted &&
    ((closeTime !== null && now > closeTime) ||
      (deadlineTime !== null && now > deadlineTime) ||
      bootcamp.status === 'completed' ||
      bootcamp.status === 'cancelled');

  const spotsLeft =
    bootcamp.maxParticipants != null && bootcamp.registeredParticipants != null
      ? bootcamp.maxParticipants - bootcamp.registeredParticipants
      : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  //  Form 
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/bootcamp/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bootcampId: bootcamp._id,
          bootcampName: bootcamp.name,
          ...data,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Registration failed');
      }

      const json = await res.json();
      // Use the freshly fetched URL from the API (bypasses the 1-hour page cache)
      if (json.data?.facebookGroupUrl) {
        setFacebookGroupUrl(json.data.facebookGroupUrl);
      }

      reset();
      setShowCongrats(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 
  // RENDER: Pre-mount skeleton (SSR + first paint) — no time-dependent content
  // 
  if (!mounted) {
    return (
      <GlassCard className="p-6 md:p-8 space-y-4 animate-pulse">
        <div className="h-7 w-40 bg-white/10 rounded-lg" />
        <div className="h-4 w-24 bg-white/5 rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-11 bg-white/5 rounded-xl border border-white/10" />
          ))}
          <div className="h-24 bg-white/5 rounded-xl border border-white/10" />
          <div className="h-12 bg-primary/20 rounded-xl" />
        </div>
      </GlassCard>
    );
  }

  // 
  // RENDER: Not yet open  Countdown
  // 
  if (notOpenYet && openCountdown) {
    return (
      <GlassCard className="p-6 md:p-8 text-center space-y-6 border border-primary/30">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Clock className="w-5 h-5" />
          <span className="font-semibold text-sm uppercase tracking-wider">Registration Opens In</span>
        </div>

        <div className="flex justify-center gap-3">
          <CountdownBlock value={openCountdown.days} label="Days" />
          <CountdownBlock value={openCountdown.hours} label="Hours" />
          <CountdownBlock value={openCountdown.minutes} label="Mins" />
          <CountdownBlock value={openCountdown.seconds} label="Secs" />
        </div>

        <p className="text-white/60 text-sm">
          Registration opens on{' '}
          <span className="text-white font-medium">
            {new Date(bootcamp.registrationOpenDate!).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </p>

        {bootcamp.googleFormUrl && (
          <p className="text-white/50 text-xs">
            You can also bookmark the registration link and check back when it opens.
          </p>
        )}
      </GlassCard>
    );
  }

  // 
  // RENDER: Closed / Full
  // 
  if (isClosed || isFull) {
    return (
      <GlassCard className="p-6 md:p-8 text-center space-y-4 border border-red-500/30 bg-red-500/5">
        <XCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">
          {isFull ? 'Bootcamp is Full' : 'Registration Closed'}
        </h3>
        <p className="text-white/60 text-sm">
          {isFull
            ? 'All seats have been filled for this bootcamp.'
            : 'Registration for this bootcamp has closed.'}
        </p>
      </GlassCard>
    );
  }

  // 
  // RENDER: Google Form redirect
  // 
  if (bootcamp.googleFormUrl) {
    return (
      <GlassCard className="p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">Register Now</h3>
          {spotsLeft !== null && spotsLeft > 0 && (
            <p className="text-primary text-sm font-medium">
              Only {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining!
            </p>
          )}
          {closeCountdown && (
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span>
                Closes in {closeCountdown.days}d {closeCountdown.hours}h {closeCountdown.minutes}m
              </span>
            </div>
          )}
        </div>

        <p className="text-white/70 text-sm leading-relaxed">
          Registration for <span className="text-white font-semibold">{bootcamp.name}</span> is
          handled through our Google Form. Click the button below to open the form and fill in your
          details.
        </p>

        <a href={bootcamp.googleFormUrl} target="_blank" rel="noopener noreferrer">
          <GradientButton variant="primary" size="lg" className="w-full">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Registration Form
          </GradientButton>
        </a>

        <p className="text-white/40 text-xs text-center">
          Opens in a new tab  Google Forms
        </p>
      </GlassCard>
    );
  }

  // 
  // RENDER: Inline registration form
  // 
  const inputClass =
    'w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/60 focus:bg-white/8 transition-all duration-200 text-sm';
  const labelClass = 'block text-white/90 font-semibold text-sm mb-1.5';
  const errorClass = 'text-red-400 text-xs mt-1';

  return (
    <>
      {/* Congratulations modal — rendered in a portal above everything */}
      {showCongrats && (
        <CongratsModal
          bootcampName={bootcamp.name}
          facebookGroupUrl={facebookGroupUrl ?? undefined}
          onClose={() => setShowCongrats(false)}
        />
      )}

      <GlassCard className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">Register Now</h3>
          {spotsLeft !== null && spotsLeft > 0 && (
            <p className="text-primary text-sm font-medium">
              Only {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining!
            </p>
          )}
          {closeCountdown && (
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span>
                Form closes in {closeCountdown.days}d {closeCountdown.hours}h {closeCountdown.minutes}m
              </span>
            </div>
          )}
        </div>

        {/* Error */}
        {submitError && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/40">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{submitError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Name */}
        <div>
          <label className={labelClass}>
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            {...register('name')}
            type="text"
            placeholder="Your full name"
            className={inputClass}
            disabled={isSubmitting}
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        {/* Date of Birth */}
        <div>
          <label className={labelClass}>
            Date of Birth <span className="text-red-400">*</span>
          </label>
          <input
            {...register('dateOfBirth')}
            type="date"
            className={inputClass + ' [color-scheme:dark]'}
            disabled={isSubmitting}
          />
          {errors.dateOfBirth && <p className={errorClass}>{errors.dateOfBirth.message}</p>}
        </div>

        {/* Occupation */}
        <div>
          <label className={labelClass}>
            Occupation <span className="text-red-400">*</span>
          </label>
          <input
            {...register('occupation')}
            type="text"
            placeholder="e.g. Student, Developer, Designer..."
            className={inputClass}
            disabled={isSubmitting}
          />
          {errors.occupation && <p className={errorClass}>{errors.occupation.message}</p>}
        </div>

        {/* Institute */}
        <div>
          <label className={labelClass}>Institute / School / University</label>
          <input
            {...register('institute')}
            type="text"
            placeholder="Your institute name"
            className={inputClass}
            disabled={isSubmitting}
          />
        </div>

        {/* Phone + WhatsApp side by side on md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Phone Number <span className="text-red-400">*</span>
            </label>
            <input
              {...register('phoneNumber')}
              type="tel"
              placeholder="+880 1XXX-XXXXXX"
              className={inputClass}
              disabled={isSubmitting}
            />
            {errors.phoneNumber && <p className={errorClass}>{errors.phoneNumber.message}</p>}
          </div>
          <div>
            <label className={labelClass}>
              WhatsApp Number <span className="text-red-400">*</span>
            </label>
            <input
              {...register('whatsappNumber')}
              type="tel"
              placeholder="+880 1XXX-XXXXXX"
              className={inputClass}
              disabled={isSubmitting}
            />
            {errors.whatsappNumber && (
              <p className={errorClass}>{errors.whatsappNumber.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            className={inputClass}
            disabled={isSubmitting}
          />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        {/* Interests */}
        <div>
          <label className={labelClass}>Interests</label>
          <input
            {...register('interests')}
            type="text"
            placeholder="e.g. Web Dev, UI/UX, AI, Mobile Apps"
            className={inputClass}
            disabled={isSubmitting}
          />
          <p className="text-white/40 text-xs mt-1">Separate with commas</p>
        </div>

        {/* Why register */}
        <div>
          <label className={labelClass}>
            Why do you want to register? <span className="text-red-400">*</span>
          </label>
          <textarea
            {...register('registrationReason')}
            placeholder="Tell us what motivates you to join this bootcamp and what you hope to achieve..."
            rows={5}
            className={inputClass + ' resize-none'}
            disabled={isSubmitting}
          />
          {errors.registrationReason && (
            <p className={errorClass}>{errors.registrationReason.message}</p>
          )}
        </div>

        {/* Submit */}
        <GradientButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </span>
          ) : (
            'Submit Registration'
          )}
        </GradientButton>

        <p className="text-white/40 text-xs text-center leading-relaxed">
          By registering, you agree to our{' '}
          <a href="/terms" className="text-primary/70 hover:text-primary underline">
            Terms
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary/70 hover:text-primary underline">
            Privacy Policy
          </a>
          . Your data is kept secure and confidential.
        </p>
      </form>
      </GlassCard>
    </>
  );
}
