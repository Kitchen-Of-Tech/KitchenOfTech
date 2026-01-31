import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { Search, ArrowLeft, Home } from 'lucide-react';

export default function ServiceNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        <GlassCard className="p-8 md:p-12 text-center">
          {/* 404 Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Search className="w-10 h-10 text-blue-400" />
            </div>
          </div>

          {/* Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Service Not Found
          </h1>

          <p className="text-white/70 text-lg mb-8">
            The service you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services">
              <GradientButton size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse All Services
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
