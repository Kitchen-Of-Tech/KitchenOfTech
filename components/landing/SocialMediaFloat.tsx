"use client";

import { useEffect, useState } from "react";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Github, Globe } from "lucide-react";
import { client } from "@/lib/sanity/client";
import { SITE_SETTINGS_QUERY } from "@/lib/sanity/queries";

type IconComponent = React.ComponentType<{ className?: string }>;

const ICON_MAP: Record<string, { icon: IconComponent; color: string }> = {
  facebook:  { icon: Facebook,  color: "#1877F2" },
  twitter:   { icon: Twitter,   color: "#1DA1F2" },
  x:         { icon: Twitter,   color: "#000000" },
  instagram: { icon: Instagram, color: "#E4405F" },
  linkedin:  { icon: Linkedin,  color: "#0A66C2" },
  youtube:   { icon: Youtube,   color: "#FF0000" },
  github:    { icon: Github,    color: "#ffffff" },
};

interface SocialLink {
  platform: string;
  url: string;
}

export function SocialMediaFloat() {
  const [links, setLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    client.fetch(SITE_SETTINGS_QUERY).then((settings) => {
      if (settings?.socialMedia?.length) {
        setLinks(settings.socialMedia);
      }
    });
  }, []);

  if (!links.length) return null;

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-4">
      {links.map((social, index) => {
        const key = social.platform?.toLowerCase() ?? "";
        const match = ICON_MAP[key];
        const Icon = match?.icon ?? Globe;
        const color = match?.color ?? "#ffffff";
        return (
          <a
            key={social.platform}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-12 h-12 glass-hover rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all animate-float"
            style={{ animationDelay: `${index * 0.1}s`, color }}
            aria-label={social.platform}
          >
            <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute right-full mr-3 px-3 py-1 glass rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
            </span>
          </a>
        );
      })}
    </div>
  );
}

