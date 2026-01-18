"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Home, Briefcase, GraduationCap, FolderOpen, BookOpen, Star, Users, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/ui/GradientButton";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Services", href: "/services", icon: Briefcase },
  { label: "Education", href: "/education", icon: GraduationCap },
  { label: "Portfolio", href: "/portfolio", icon: FolderOpen },
  { label: "Our Thoughts", href: "/blog", icon: BookOpen },
];

const dropdownItems: NavItem[] = [
  { label: "Testimonials", href: "/testimonials", icon: Star },
  { label: "Team Members", href: "/team", icon: Users },
  { label: "Certificate Verify", href: "/certificate-verify", icon: ShieldCheck },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            Kitchen of Tech
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-white/90 hover:text-white transition-colors duration-200 font-medium relative group flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300" />
                </Link>
              );
            })}

            {/* Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className="text-white/90 hover:text-white transition-colors duration-200 font-medium flex items-center gap-1">
                Other
                <ChevronDown className="w-4 h-4" />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-2 glass rounded-xl p-2 min-w-[200px] shadow-glass-lg animate-fade-down">
                  {dropdownItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CTA Button */}
            <Link href="/meeting">
              <GradientButton variant="primary" size="md">
                Meeting for Hire
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
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-white/90 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            {dropdownItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-white/90 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            <div className="mt-4 pt-4 border-t border-white/10">
              <Link href="/meeting" onClick={() => setMobileMenuOpen(false)}>
                <GradientButton variant="primary" size="md" fullWidth>
                  Meeting for Hire
                </GradientButton>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
