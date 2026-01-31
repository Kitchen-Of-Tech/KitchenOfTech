import Link from 'next/link';
import { SearchX, Home, ArrowLeft } from 'lucide-react';
import { GradientButton } from '@/components/ui/GradientButton';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[12rem] font-bold text-gradient leading-none">
            404
          </h1>
        </div>

        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <SearchX className="w-12 h-12 text-white/60" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-xl text-white/60 mb-12 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <GradientButton variant="primary" size="lg">
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </GradientButton>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-16">
          <p className="text-sm text-white/40 mb-4">Or explore these pages:</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/services" className="text-blue-400 hover:text-blue-300 underline">
              Services
            </Link>
            <Link href="/portfolio" className="text-blue-400 hover:text-blue-300 underline">
              Portfolio
            </Link>
            <Link href="/blog" className="text-blue-400 hover:text-blue-300 underline">
              Blog
            </Link>
            <Link href="/team" className="text-blue-400 hover:text-blue-300 underline">
              Team
            </Link>
            <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
