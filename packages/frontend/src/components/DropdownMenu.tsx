import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface DropdownItem {
  label: string;
  to?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  variant?: 'default' | 'destructive';
  separator?: boolean;
}

interface Props {
  label: string;
  items: DropdownItem[];
}

export default function DropdownMenu({ label, items }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const location = useLocation();

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus item when focusedIndex changes
  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  const handleTriggerKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen) setIsOpen(true);
        setFocusedIndex(0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen) setIsOpen(true);
        setFocusedIndex(items.length - 1);
      }
    },
    [isOpen, items.length]
  );

  const handleMenuKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
      }
    },
    [items.length]
  );

  const isActive = items.some(
    (item) => item.to && location.pathname.startsWith(item.to)
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen((o) => !o);
          setFocusedIndex(-1);
        }}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`flex items-center gap-1 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2 rounded-full px-1 py-0.5 ${
          isActive ? 'text-pine-500' : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        {label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="menu"
            aria-label={label}
            onKeyDown={handleMenuKeyDown}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] border border-stone-100/50 py-2 min-w-[200px] z-50"
          >
            {items.map((item, index) => {
              const isDestructive = item.variant === 'destructive';
              const isCurrent = item.to && location.pathname === item.to;

              const cls = [
                'flex items-center gap-3 w-[calc(100%-8px)] mx-1 px-4 py-3 text-sm rounded-xl transition-colors duration-200 text-left',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-inset',
                isDestructive
                  ? 'text-red-500 hover:bg-red-50 hover:text-red-600'
                  : isCurrent
                    ? 'bg-sage text-pine-600 font-medium'
                    : 'text-stone-600 hover:bg-sage hover:text-stone-800',
              ].join(' ');

              const icon = item.icon ? (
                <item.icon
                  size={16}
                  className={isDestructive ? 'text-red-400' : 'text-stone-400'}
                  aria-hidden="true"
                />
              ) : null;

              return (
                <div key={item.label}>
                  {item.separator && (
                    <div className="h-px bg-stone-100 my-1 mx-3" />
                  )}
                  {item.to ? (
                    <Link
                      to={item.to}
                      role="menuitem"
                      tabIndex={-1}
                      ref={(el: HTMLAnchorElement | null) => {
                        itemRefs.current[index] = el;
                      }}
                      className={cls}
                      onClick={() => {
                        setIsOpen(false);
                        setFocusedIndex(-1);
                      }}
                    >
                      {icon}
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      role="menuitem"
                      tabIndex={-1}
                      ref={(el: HTMLButtonElement | null) => {
                        itemRefs.current[index] = el;
                      }}
                      className={cls}
                      onClick={() => {
                        item.onClick?.();
                        setIsOpen(false);
                        setFocusedIndex(-1);
                      }}
                    >
                      {icon}
                      {item.label}
                    </button>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
