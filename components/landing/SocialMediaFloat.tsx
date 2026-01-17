"use client";

import { Facebook, Twitter, Instagram, Linkedin, Youtube, Github } from "lucide-react";

const socialLinks = [
  { platform: "facebook", icon: Facebook, url: "https://facebook.com", color: "#1877F2" },
  { platform: "twitter", icon: Twitter, url: "https://twitter.com", color: "#1DA1F2" },
  { platform: "instagram", icon: Instagram, url: "https://instagram.com", color: "#E4405F" },
  { platform: "linkedin", icon: Linkedin, url: "https://linkedin.com", color: "#0A66C2" },
  { platform: "youtube", icon: Youtube, url: "https://youtube.com", color: "#FF0000" },
  { platform: "github", icon: Github, url: "https://github.com", color: "#ffffff" },
];

export function SocialMediaFloat() {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-4">
      {socialLinks.map((social, index) => {
        const Icon = social.icon;
        return (
          <a
            key={social.platform}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-12 h-12 glass-hover rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all animate-float"
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
            aria-label={social.platform}
          >
            <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            
            {/* Hover Tooltip */}
            <span className="absolute right-full mr-3 px-3 py-1 glass rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
            </span>
          </a>
        );
      })}
    </div>
  );
}
