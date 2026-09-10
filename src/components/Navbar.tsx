'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Logo } from './Logo';
import { 
  Heart, 
  MessageSquare, 
  BookOpen, 
  Clock, 
  LifeBuoy, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  Shield,
  Activity,
  Gamepad2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  // Define navigation tabs based on user roles
  const getNavLinks = () => {
    if (!user || !profile) return [];

    if (profile.role === 'counsellor') {
      return [
        { href: '/counsellor', label: 'Counsellor Queue', icon: Activity },
        { href: '/settings', label: 'Settings', icon: Settings },
      ];
    }

    if (profile.role === 'admin') {
      return [
        { href: '/admin', label: 'Admin Panel', icon: Shield },
        { href: '/settings', label: 'Settings', icon: Settings },
      ];
    }

    // Standard User Links
    return [
      { href: '/dashboard', label: 'Dashboard', icon: Heart },
      { href: '/detect', label: 'Biometric Scan', icon: Activity },
      { href: '/chat', label: 'Talk to SAATHI', icon: MessageSquare },
      { href: '/journal', label: 'Journal', icon: BookOpen },
      { href: '/arcade', label: 'Relief Arcade', icon: Gamepad2 },
      { href: '/history', label: 'Distress History', icon: Clock },
      { href: '/resources', label: 'Self Help', icon: LifeBuoy },
      { href: '/settings', label: 'Settings', icon: Settings },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <nav className="w-full bg-white border-b border-[#EEF1FB] sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Side: Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Logo showText size={38} />
            </Link>
          </div>

          {/* Desktop Nav Links (Right Side) */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-[#EEF1FB] text-[#3E5FE0]'
                          : 'text-[#3E6B63] hover:bg-[#EEF1FB]/55 hover:text-[#3E5FE0]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3.5 py-2 ml-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-[#3E6B63] hover:text-[#3E5FE0] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 rounded-lg shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#3E6B63] hover:text-[#3E5FE0] hover:bg-[#EEF1FB] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Links */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#EEF1FB] px-2 pt-2 pb-4 space-y-1 shadow-inner animate-fadeIn">
          {user ? (
            <>
              {/* Display user identity tag */}
              <div className="px-3 py-2 border-b border-[#EEF1FB] mb-2 text-xs font-semibold text-[#3E6B63]/70 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Logged in: {profile?.full_name} ({profile?.role})</span>
              </div>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-base font-medium transition-all ${
                      active
                        ? 'bg-[#EEF1FB] text-[#3E5FE0]'
                        : 'text-[#3E6B63] hover:bg-[#EEF1FB]/40'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-all text-left"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 p-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 border border-[#3E6B63]/20 rounded-lg text-[#3E6B63] hover:bg-[#EEF1FB]/50 text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 bg-[#3E5FE0] hover:bg-[#3E5FE0]/90 text-white rounded-lg text-sm font-medium shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
export default Navbar;
