'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service (Sentry is configured)
    console.error('Global Error:', error);
  }, [error]);

  return (
    <div className="bg-gradient-to-b from-black via-gray-950 to-black min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center"
      >
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-8 flex justify-center"
          >
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
          </motion.div>

          {/* Error Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Something went wrong!
          </h1>
          <p className="text-xl text-white/60 mb-8">
            We encountered an unexpected error. Don&apos;t worry, our team has been notified.
          </p>

          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10 text-left">
              <h3 className="text-lg font-semibold text-white mb-2">Error Details:</h3>
              <pre className="text-sm text-red-400 overflow-auto max-h-40">
                {error.message}
              </pre>
              {error.digest && (
                <p className="text-xs text-white/40 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
          </div>

          {/* Support Link */}
          <p className="mt-8 text-sm text-white/40">
            Need help?{' '}
            <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline">
              Contact our support team
            </Link>
          </p>
      </motion.div>
    </div>
  );
}
