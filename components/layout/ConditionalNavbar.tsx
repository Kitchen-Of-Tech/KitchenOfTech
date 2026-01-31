'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';

export function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Don't show navbar on dashboard, studio, or auth pages
  const hideNavbar = pathname?.startsWith('/dashboard') || 
                     pathname?.startsWith('/studio') ||
                     pathname?.startsWith('/education/dashboard') ||
                     pathname?.startsWith('/education/instructor/dashboard') ||
                     pathname?.startsWith('/education/learn');
  
  if (hideNavbar) {
    return null;
  }
  
  return <Navbar />;
}
