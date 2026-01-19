"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, MoreHorizontal, Home, Briefcase, GraduationCap, FolderOpen, BookOpen, Star, Users, ShieldCheck, LogIn, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

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
            className="text-xl lg:text-2xl font-bold text-gradient hover:opacity-80 transition-opacity"
          >
            Kitchen of Tech
          </Link>

          {/* Desktop Navigation - Icon with Label */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative group flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}

            {/* Dropdown - More Options */}
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300">
                <MoreHorizontal className="w-5 h-5" />
                <span className="text-xs font-medium whitespace-nowrap">More</span>
              </button>

              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-2 glass rounded-xl p-2 min-w-[220px] shadow-2xl border border-white/20 animate-fade-down">
                  {dropdownItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
                      >
                        <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-12 bg-white/20 mx-1"></div>

            {/* CTA Buttons - Icon with Label */}
            <Link href="/login" className="relative group">
              <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300">
                <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium whitespace-nowrap">Login</span>
              </div>
            </Link>

            <Link href="/meeting" className="relative group">
              <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium whitespace-nowrap">Meeting</span>
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 glass rounded-xl p-4 animate-fade-down border border-white/10">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
                  >
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}

              <div className="my-2 h-px bg-white/10"></div>

              {dropdownItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
                  >
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white/90 hover:text-white border border-white/20 hover:border-white/30 rounded-xl transition-all duration-200 font-medium hover:bg-white/5">
                  <LogIn className="w-5 h-5" />
                  Login
                </button>
              </Link>
              <Link href="/meeting" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white font-medium rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg">
                  <Calendar className="w-5 h-5" />
                  Meeting for Hire
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
