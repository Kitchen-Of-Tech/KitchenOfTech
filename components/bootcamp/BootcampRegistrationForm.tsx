'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ExternalLink, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
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

//  Main Component 

interface BootcampRegistrationFormProps {
  bootcamp: Bootcamp;
}

export default function BootcampRegistrationForm({ bootcamp }: BootcampRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
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

      setSubmitSuccess(true);
      reset();
      setTimeout(() => setSubmitSuccess(false), 8000);
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

      {/* Success */}
      {submitSuccess && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/40">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-400 font-semibold text-sm">Registration Successful!</p>
            <p className="text-white/60 text-xs mt-0.5">
              We have received your registration and will get in touch soon.
            </p>
          </div>
        </div>
      )}

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
  );
}
