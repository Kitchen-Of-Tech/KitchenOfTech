"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/ui/GradientButton";

interface NavItem {
  label: string;
  href: string;
  order: number;
}

interface NavbarProps {
  logo?: string;
  siteName?: string;
  items?: NavItem[];
  ctaButton?: {
    label: string;
    href: string;
  };
  dropdownItems?: {
    label: string;
    items: NavItem[];
  }[];
}

export function Navbar({
  siteName = "Kitchen of Tech",
  items = [
    { label: "Home", href: "/", order: 1 },
    { label: "Services", href: "/services", order: 2 },
    { label: "Education", href: "/education", order: 3 },
    { label: "Portfolio", href: "/portfolio", order: 4 },
    { label: "Our Thoughts", href: "/blog", order: 5 },
  ],
  ctaButton = { label: "Meeting for Hire", href: "/meeting" },
  dropdownItems = [
    {
      label: "Other",
      items: [
        { label: "Testimonials", href: "/testimonials", order: 1 },
        { label: "Team Members", href: "/team", order: 2 },
        { label: "Certificate Verify", href: "/certificate-verify", order: 3 },
      ],
    },
  ],
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "glass backdrop-blur-xl shadow-glass py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-gradient hover:opacity-80 transition-opacity"
          >
            {siteName}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {sortedItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/90 hover:text-white transition-colors duration-200 font-medium relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300" />
              </Link>
            ))}

            {/* Dropdown */}
            {dropdownItems.map((dropdown) => (
              <div
                key={dropdown.label}
                className="relative"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button className="text-white/90 hover:text-white transition-colors duration-200 font-medium flex items-center gap-1">
                  {dropdown.label}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 glass rounded-xl p-2 min-w-[200px] shadow-glass-lg animate-fade-down">
                    {dropdown.items.sort((a, b) => a.order - b.order).map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-white/90 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* CTA Button */}
            <Link href={ctaButton.href}>
              <GradientButton variant="primary" size="md">
                {ctaButton.label}
              </GradientButton>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 glass rounded-xl p-4 animate-fade-down">
            {sortedItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-white/90 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}

            {dropdownItems.map((dropdown) =>
              dropdown.items.sort((a, b) => a.order - b.order).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-white/90 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                >
                  {item.label}
                </Link>
              ))
            )}

            <div className="mt-4 pt-4 border-t border-white/10">
              <Link href={ctaButton.href} onClick={() => setMobileMenuOpen(false)}>
                <GradientButton variant="primary" size="md" fullWidth>
                  {ctaButton.label}
                </GradientButton>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
