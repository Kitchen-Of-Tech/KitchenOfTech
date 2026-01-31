'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export default function ServiceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error('Service page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        <GlassCard className="p-8 md:p-12 text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Something Went Wrong
          </h1>

          <p className="text-white/70 text-lg mb-2">
            We encountered an error while loading this service.
          </p>

          {error.digest && (
            <p className="text-white/50 text-sm mb-8 font-mono">
              Error ID: {error.digest}
            </p>
          )}

          {/* Development Error Details */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
              <p className="text-red-400 text-sm font-mono whitespace-pre-wrap break-words">
                {error.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <GradientButton
              onClick={reset}
              size="lg"
            >
              Try Again
            </GradientButton>

            <Link href="/services">
              <GradientButton variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Services
              </GradientButton>
            </Link>

            <Link href="/">
              <GradientButton variant="outline" size="lg">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </GradientButton>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
