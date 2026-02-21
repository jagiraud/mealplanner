import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Settings, LogOut, Mail, CalendarDays } from 'lucide-react';

const reveal = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function SettingsPage() {
  const shouldReduceMotion = useReducedMotion();
  const [loggingOut, setLoggingOut] = useState(false);

  function handleLogout() {
    if (!window.confirm('Are you sure you want to log out?')) return;
    setLoggingOut(true);
    // TODO: implement actual logout
    setTimeout(() => {
      setLoggingOut(false);
      console.log('Logged out');
    }, 500);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      {/* Page heading */}
      <div className="pt-24 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mb-2">
          Settings
        </h1>
        <p className="text-base text-stone-500 leading-relaxed">
          Account information and preferences.
        </p>
      </div>

      <motion.div
        initial={shouldReduceMotion ? false : 'hidden'}
        animate={shouldReduceMotion ? false : 'visible'}
        variants={stagger}
        className="space-y-6 pb-16"
      >
        {/* Account info card */}
        <motion.div
          variants={shouldReduceMotion ? undefined : reveal}
          className="bg-white rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-pine-500 flex items-center justify-center">
              <Settings size={18} className="text-white" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900">Account</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 py-3 border-b border-stone-100">
              <Mail
                size={14}
                className="text-stone-400 flex-shrink-0"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-medium text-stone-500">Email</p>
                <p className="text-sm text-stone-800">user@example.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3">
              <CalendarDays
                size={14}
                className="text-stone-400 flex-shrink-0"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-medium text-stone-500">
                  Member since
                </p>
                <p className="text-sm text-stone-800">January 2025</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Danger zone */}
        <motion.div
          variants={shouldReduceMotion ? undefined : reveal}
          className="bg-white rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-6 sm:p-8"
        >
          <h2 className="text-lg font-semibold text-stone-900 mb-2">Session</h2>
          <p className="text-sm text-stone-500 mb-6">
            Sign out of your account on this device.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 bg-red-50 text-red-600 rounded-full px-6 py-3 text-sm font-medium hover:bg-red-100 disabled:opacity-40 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
          >
            <LogOut size={16} aria-hidden="true" />
            {loggingOut ? 'Logging out...' : 'Log out'}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
