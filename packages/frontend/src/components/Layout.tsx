import { NavLink, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Menu,
  X,
  UtensilsCrossed,
  Search,
  BookOpen,
  User,
  Heart,
  Settings,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { healthCheck } from '../api/health';
import DropdownMenu from './DropdownMenu';
import type { DropdownItem } from './DropdownMenu';

const mealsItems: DropdownItem[] = [
  { label: 'Plan meals', to: '/meal-plan', icon: UtensilsCrossed },
  { label: 'Browse recipes', to: '/recipes', icon: Search },
  { label: 'Cookbook', to: '/cookbook', icon: BookOpen },
];

const accountItems: DropdownItem[] = [
  { label: 'Profile', to: '/profile', icon: User },
  { label: 'Favourites', to: '/favourites', icon: Heart },
  { label: 'Settings', to: '/settings', icon: Settings },
  {
    label: 'Logout',
    icon: LogOut,
    variant: 'destructive',
    separator: true,
    onClick: () => {
      if (window.confirm('Are you sure you want to log out?')) {
        // TODO: implement actual logout
        console.log('Logged out');
      }
    },
  },
];

const mobileLinks = [
  { label: 'Plan meals', to: '/meal-plan', icon: UtensilsCrossed },
  { label: 'Browse recipes', to: '/recipes', icon: Search },
  { label: 'Cookbook', to: '/cookbook', icon: BookOpen },
];

const mobileAccountLinks = [
  { label: 'Profile', to: '/profile', icon: User },
  { label: 'Favourites', to: '/favourites', icon: Heart },
  { label: 'Settings', to: '/settings', icon: Settings },
];

export default function Layout() {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    healthCheck()
      .then(() => setHealthy(true))
      .catch(() => setHealthy(false));
  }, []);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const dotClass = `w-1.5 h-1.5 rounded-full transition-colors ${
    healthy === null ? 'bg-stone-300' : healthy ? 'bg-pine-400' : 'bg-red-400'
  }`;
  const dotTitle =
    healthy === null ? 'Checking API…' : healthy ? 'API online' : 'API offline';

  return (
    <div className="min-h-screen bg-canvas">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-20 focus:left-4 focus:z-[100] focus:bg-pine-500 focus:text-white focus:rounded-full focus:px-6 focus:py-2 focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      {/* Floating pill nav */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white/70 backdrop-blur-[20px] shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] rounded-full h-14 px-4 sm:px-6 flex items-center gap-2 sm:gap-6 max-w-[calc(100%-32px)] sm:max-w-none">
        {/* Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2.5 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2 rounded-full"
        >
          <div className="w-8 h-8 rounded-full bg-pine-500 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
          <span className="text-sm font-semibold text-stone-900 tracking-tight hidden sm:inline">
            Meal Planner
          </span>
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-6">
          <NavLink
            to="/"
            end
            className={({ isActive }: { isActive: boolean }) =>
              `text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2 rounded-full px-1 py-0.5 ${
                isActive
                  ? 'text-pine-500'
                  : 'text-stone-500 hover:text-stone-800'
              }`
            }
          >
            Home
          </NavLink>

          <DropdownMenu label="Meals" items={mealsItems} />
          <DropdownMenu label="Account" items={accountItems} />

          <span title={dotTitle} className={dotClass} />
        </div>

        {/* Mobile hamburger */}
        <div className="sm:hidden ml-auto flex items-center gap-3">
          <span title={dotTitle} className={dotClass} />
          <button
            type="button"
            className="p-1.5 text-stone-500 hover:text-stone-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2 rounded-full"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={shouldReduceMotion ? false : { y: '-100%' }}
            animate={{ y: 0 }}
            exit={shouldReduceMotion ? undefined : { y: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-[20px] sm:hidden overflow-y-auto"
          >
            <div className="px-6 pt-24 pb-12">
              {/* Close button */}
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 rounded-full"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>

              {/* Meals group */}
              <p className="font-cursive text-2xl text-stone-400 mb-4">Meals</p>
              <div className="space-y-1 mb-10">
                {mobileLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }: { isActive: boolean }) =>
                      `flex items-center gap-3 py-3 px-4 rounded-xl text-base transition-colors duration-200 ${
                        isActive
                          ? 'bg-sage text-pine-600 font-medium'
                          : 'text-stone-600 hover:bg-sage hover:text-stone-800'
                      }`
                    }
                  >
                    <link.icon size={18} className="text-stone-400" />
                    {link.label}
                  </NavLink>
                ))}
              </div>

              {/* Account group */}
              <p className="font-cursive text-2xl text-stone-400 mb-4">
                Account
              </p>
              <div className="space-y-1 mb-10">
                {mobileAccountLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }: { isActive: boolean }) =>
                      `flex items-center gap-3 py-3 px-4 rounded-xl text-base transition-colors duration-200 ${
                        isActive
                          ? 'bg-sage text-pine-600 font-medium'
                          : 'text-stone-600 hover:bg-sage hover:text-stone-800'
                      }`
                    }
                  >
                    <link.icon size={18} className="text-stone-400" />
                    {link.label}
                  </NavLink>
                ))}

                <div className="h-px bg-stone-100 my-3 mx-4" />

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (window.confirm('Are you sure you want to log out?')) {
                      console.log('Logged out');
                    }
                  }}
                  className="flex items-center gap-3 py-3 px-4 rounded-xl text-base text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 w-full text-left"
                >
                  <LogOut size={18} className="text-red-400" />
                  Logout
                </button>
              </div>

              {/* Health status */}
              <div className="flex items-center gap-2 px-4">
                <span className={dotClass} />
                <span className="text-sm text-stone-400">{dotTitle}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
