'use client';

import { MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const WHATSAPP_NUMBER = '8801518995764'; // WhatsApp number without + sign
const WHATSAPP_MESSAGE = 'Hi! I would like to know more about your services.';

export function FloatingWhatsApp() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Show button after component mounts (avoid hydration mismatch)
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(WHATSAPP_MESSAGE);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <div
        className="fixed bottom-6 left-6 z-40 group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleWhatsAppClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleWhatsAppClick();
          }
        }}
        aria-label="Contact us on WhatsApp"
      >
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse opacity-25" />

        {/* Animated Rings */}
        <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping" />

        {/* Main Button */}
        <div
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 ease-out transform hover:-translate-y-1"
          style={{
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            boxShadow: isHovered ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            transitionDuration: '300ms'
          }}
        >
          {/* Icon */}
          <MessageCircle
            className="w-6 h-6 text-white transition-transform duration-300"
            style={{
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
              transitionDuration: '300ms'
            }}
            fill="currentColor"
          />

          {/* Hover Tooltip */}
          {isHovered && (
            <div
              className="absolute left-16 bg-gray-900 text-white px-3 py-2 rounded-lg whitespace-nowrap text-sm font-medium shadow-lg pointer-events-none"
              style={{
                animation: 'fadeIn 0.3s ease-out forwards'
              }}
            >
              Chat with us on WhatsApp
              <div
                className="absolute -right-1 top-1/2 -translate-y-1/2"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid rgb(17, 24, 39)',
                  borderTop: '4px solid transparent',
                  borderBottom: '4px solid transparent'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Keyboard Accessible Link (Hidden but available for screen readers) */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="sr-only focus:not-sr-only"
        aria-label="Open WhatsApp conversation"
      >
        WhatsApp Chat
      </a>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
