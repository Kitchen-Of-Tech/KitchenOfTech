'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { GradientButton } from '@/components/ui/GradientButton';
import MeetingForm from '@/components/meetings/MeetingForm';
import { motion, AnimatePresence } from 'framer-motion';

interface ServiceMeetingButtonProps {
  service: {
    slug: string;
    title: string;
  };
  variant?: 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  buttonText?: string;
}

export function ServiceMeetingButton({
  service,
  variant = 'primary',
  size = 'lg',
  buttonText = 'Hire for this service'
}: ServiceMeetingButtonProps) {
  const [showMeetingForm, setShowMeetingForm] = useState(false);

  return (
    <>
      {/* Modal */}
      <AnimatePresence>
        {showMeetingForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowMeetingForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <MeetingForm
                preselectedService={{
                  slug: service.slug,
                  title: service.title
                }}
                onClose={() => setShowMeetingForm(false)}
                onSuccess={() => {
                  setTimeout(() => {
                    setShowMeetingForm(false);
                  }, 2000);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button */}
      <GradientButton 
        variant={variant} 
        size={size}
        onClick={() => setShowMeetingForm(true)}
      >
        <Calendar className="w-5 h-5 mr-2" />
        {buttonText}
      </GradientButton>
    </>
  );
}
