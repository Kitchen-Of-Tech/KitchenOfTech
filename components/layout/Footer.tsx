"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Github, Mail, Phone, MapPin } from "lucide-react";
import { client } from "@/lib/sanity/client";
import { SITE_SETTINGS_QUERY, FOOTER_SETTINGS_QUERY } from "@/lib/sanity/queries";
import type { SiteSettings, FooterSettings } from "@/types";

type IconComponent = React.ComponentType<{ className?: string }>;

const socialIcons: Record<string, IconComponent> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  github: Github,
};

export function Footer() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [footerSettings, setFooterSettings] = useState<FooterSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [site, footer] = await Promise.all([
          client.fetch<SiteSettings>(SITE_SETTINGS_QUERY),
          client.fetch<FooterSettings>(FOOTER_SETTINGS_QUERY),
        ]);
        setSiteSettings(site);
        setFooterSettings(footer);
      } catch (error) {
        console.error("Error fetching footer settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const currentYear = new Date().getFullYear();

  // Fallback data
  const defaultFooterLinks = {
    company: [
      { label: "About Us", href: "/about" },
      { label: "Our Team", href: "/team" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
    services: [
      { label: "Web Development", href: "/services/web-development" },
      { label: "Mobile Apps", href: "/services/mobile-apps" },
      { label: "UI/UX Design", href: "/services/ui-ux-design" },
      { label: "Digital Marketing", href: "/services/digital-marketing" },
    ],
    resources: [
      { label: "Blog", href: "/blog" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Testimonials", href: "/testimonials" },
      { label: "Certificate Verify", href: "/certificate-verify" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  };

  const siteName = siteSettings?.siteName || "Kitchen of Tech";
  const description = siteSettings?.siteDescription || "Transform your digital presence with cutting-edge technology solutions. Expert team delivering innovative IT and creative services.";
  const socialMedia = siteSettings?.socialMedia || [];
  const companyLinks = footerSettings?.companyLinks || defaultFooterLinks.company;
  const servicesLinks = footerSettings?.servicesLinks || defaultFooterLinks.services;
  const resourcesLinks = footerSettings?.resourcesLinks || defaultFooterLinks.resources;
  const legalLinks = footerSettings?.legalLinks || defaultFooterLinks.legal;
  const copyrightText = footerSettings?.copyrightText || `© ${currentYear} ${siteName}. All rights reserved.`;

  if (loading) {
    return (
      <footer className="relative bg-black/50 backdrop-blur-sm border-t border-white/10">
        <div className="container-custom section-padding">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="h-3 bg-white/10 rounded"></div>
                <div className="h-3 bg-white/10 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative bg-black/50 backdrop-blur-sm border-t border-white/10">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gradient">{siteName}</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              {description}
            </p>
            {/* Social Media */}
            {socialMedia.length > 0 && (
              <div className="flex gap-3 pt-4">
                {socialMedia.map((social) => {
                  const Icon = socialIcons[social.platform.toLowerCase()];
                  return Icon ? (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 glass-hover rounded-lg flex items-center justify-center text-white/70 hover:text-white transition-colors"
                      aria-label={social.platform}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Company Links */}
          {companyLinks.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Services Links */}
          {servicesLinks.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-3">
                {servicesLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact & Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              {siteSettings?.email && (
                <li className="flex items-start gap-2 text-white/70 text-sm">
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <a href={`mailto:${siteSettings.email}`} className="hover:text-white transition-colors">
                    {siteSettings.email}
                  </a>
                </li>
              )}
              {siteSettings?.phone && (
                <li className="flex items-start gap-2 text-white/70 text-sm">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <a href={`tel:${siteSettings.phone}`} className="hover:text-white transition-colors">
                    {siteSettings.phone}
                  </a>
                </li>
              )}
              {siteSettings?.address && (
                <li className="flex items-start gap-2 text-white/70 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{siteSettings.address}</span>
                </li>
              )}
            </ul>
            
            {/* Resources Links */}
            {resourcesLinks.length > 0 && (
              <>
                <h4 className="text-white font-semibold mb-4 mt-6">Resources</h4>
                <ul className="space-y-3">
                  {resourcesLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-white/70 hover:text-white transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm">
              {copyrightText}
            </p>
            {legalLinks.length > 0 && (
              <div className="flex gap-6">
                {legalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </footer>
  );
}
