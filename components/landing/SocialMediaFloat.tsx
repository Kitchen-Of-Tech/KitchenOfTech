"use client";

import { useEffect, useState } from "react";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Github, Globe, Send } from "lucide-react";
import { client } from "@/lib/sanity/client";
import { SITE_SETTINGS_QUERY } from "@/lib/sanity/queries";

type IconComponent = React.ComponentType<{ className?: string }>;

interface IconConfig {
  icon: IconComponent;
  gradient: string;
  label: string;
}

const ICON_MAP: Record<string, IconConfig> = {
  facebook: {
    icon: Facebook,
    gradient: "from-[#1877F2] to-[#0d5ecd]",
    label: "Facebook",
  },
  twitter: {
    icon: Twitter,
    gradient: "from-[#1DA1F2] to-[#0c85d0]",
    label: "Twitter",
  },
  x: {
    icon: Twitter,
    gradient: "from-neutral-700 to-neutral-900",
    label: "X",
  },
  instagram: {
    icon: Instagram,
    gradient: "from-[#f09433] via-[#dc2743] to-[#bc1888]",
    label: "Instagram",
  },
  linkedin: {
    icon: Linkedin,
    gradient: "from-[#0A66C2] to-[#004182]",
    label: "LinkedIn",
  },
  youtube: {
    icon: Youtube,
    gradient: "from-[#FF0000] to-[#cc0000]",
    label: "YouTube",
  },
  github: {
    icon: Github,
    gradient: "from-neutral-600 to-neutral-800",
    label: "GitHub",
  },
  telegram: {
    icon: Send,
    gradient: "from-[#2AABEE] to-[#0088cc]",
    label: "Telegram",
  },
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
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3">
      {links.map((social, index) => {
        const key = (social.platform ?? "").toLowerCase();
        const config = ICON_MAP[key];
        const Icon = config?.icon ?? Globe;
        const gradient = config?.gradient ?? "from-blue-500 to-purple-600";
        const label = config?.label ?? social.platform;

        return (
          <a
            key={social.platform}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="group relative flex items-center justify-end"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            {/* Tooltip label */}
            <span
              className="absolute right-14 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg text-xs font-semibold text-white whitespace-nowrap pointer-events-none opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
            >
              {label}
            </span>

            {/* Icon button */}
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ring-1 ring-white/10 group-hover:ring-white/30 group-hover:scale-110 group-hover:shadow-2xl transition-all duration-200`}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>
          </a>
        );
      })}
    </div>
  );
}
