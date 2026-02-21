import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Calendar, ChevronDown, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MealPlan } from '@mealplanner/shared';
import { getMealPlans } from '../api/mealPlanHistory';
import LoadingSpinner from '../components/LoadingSpinner';

const inputClass =
  'w-full bg-stone-50 rounded-full px-5 py-3 text-sm text-stone-700 placeholder:text-stone-400 border-none outline-none focus:ring-2 focus:ring-pine-400 transition-all duration-200';
const labelClass = 'block text-xs font-medium text-stone-500 mb-2';

const MEAL_LABELS = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Supper',
  'Late snack',
];

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

export default function CookbookPage() {
  const [userId, setUserId] = useState('');
  const [mealPlans, setMealPlans] = useState<MealPlan[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  async function fetchMealPlans(id: string) {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getMealPlans(id.trim());
      if (result.success && result.data) {
        setMealPlans(result.data);
      } else {
        setError(result.error ?? 'Failed to load meal plans');
      }
    } catch {
      setError('Could not reach the API. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchMealPlans(userId);
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      {/* Page heading */}
      <div className="pt-24 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mb-2">
          Cookbook
        </h1>
        <p className="text-base text-stone-500 leading-relaxed">
          Your meal plan history and past recipes.
        </p>
      </div>

      {/* User ID input */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-6 sm:p-8 mb-10 space-y-5"
      >
        <div>
          <label className={labelClass}>
            User ID <span className="text-red-400">*</span>
          </label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="550e8400-e29b-41d4-a716-446655440000"
            autoComplete="off"
            spellCheck={false}
            className={`${inputClass} font-mono text-xs`}
          />
        </div>
        <div className="pt-1">
          <button
            type="submit"
            disabled={loading || !userId.trim()}
            className="bg-stone-900 text-white rounded-full px-8 py-3 font-medium hover:bg-stone-800 disabled:opacity-40 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2"
          >
            {loading ? 'Loading...' : 'Load meal plans'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 text-red-600 rounded-2xl px-5 py-4 mb-8 text-sm">
          {error}
        </div>
      )}

      {loading && <LoadingSpinner />}

      <AnimatePresence>
        {!loading && mealPlans !== null && (
          <motion.div
            initial={shouldReduceMotion ? false : 'hidden'}
            animate={shouldReduceMotion ? false : 'show'}
            variants={listVariants}
            className="pb-16"
          >
            {mealPlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <motion.div
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    to="/meal-plan"
                    className="w-44 h-44 rounded-full bg-pine-500 hover:bg-pine-600 transition-colors duration-300 flex flex-col items-center justify-center text-white shadow-[0_4px_20px_-2px_rgba(19,132,38,0.25)] hover:shadow-[0_8px_30px_-4px_rgba(19,132,38,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-4"
                  >
                    <UtensilsCrossed size={36} />
                    <span className="text-sm font-medium mt-2">
                      Generate your first plan
                    </span>
                  </Link>
                </motion.div>
                <p className="text-base text-stone-400 mt-8 text-center max-w-sm">
                  No meal plans yet. Generate your first one!
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-stone-400 mb-5">
                  {mealPlans.length} meal plan
                  {mealPlans.length !== 1 ? 's' : ''}
                </p>
                <div className="space-y-4">
                  {mealPlans.map((plan) => {
                    const isExpanded = expandedId === plan.id;
                    const totalMeals = plan.days.reduce(
                      (sum, day) => sum + day.recipes.length,
                      0
                    );

                    return (
                      <motion.div
                        key={plan.id}
                        variants={shouldReduceMotion ? undefined : cardVariants}
                        className="bg-white rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] overflow-hidden"
                      >
                        {/* Header / toggle */}
                        <button
                          type="button"
                          onClick={() => toggleExpand(plan.id)}
                          className="w-full px-6 py-5 flex items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2 rounded-3xl transition-colors hover:bg-stone-50/50"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1.5">
                              <Calendar
                                size={14}
                                className="text-pine-500 flex-shrink-0"
                                aria-hidden="true"
                              />
                              <h3 className="text-sm font-medium text-stone-900">
                                Week of {formatDate(plan.weekStart)}
                              </h3>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-stone-400">
                              <span>
                                {plan.days.length} day
                                {plan.days.length !== 1 ? 's' : ''}
                              </span>
                              <span>
                                {totalMeals} meal{totalMeals !== 1 ? 's' : ''}
                              </span>
                              <span>Created {formatDate(plan.createdAt)}</span>
                            </div>
                          </div>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown size={18} className="text-stone-400" />
                          </motion.div>
                        </button>

                        {/* Expanded content */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{
                                duration: 0.3,
                                ease: 'easeInOut',
                              }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-stone-100">
                                {plan.days.map((day, i) => {
                                  const dayLabel = new Date(
                                    day.date
                                  ).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric',
                                  });
                                  return (
                                    <div
                                      key={i}
                                      className={
                                        i > 0 ? 'border-t border-stone-100' : ''
                                      }
                                    >
                                      <div className="px-6 py-3 bg-stone-50/50">
                                        <h4 className="text-xs font-medium text-stone-400">
                                          {dayLabel}
                                        </h4>
                                      </div>
                                      <ul>
                                        {day.recipes.map((meal, j) => (
                                          <li
                                            key={j}
                                            className={`px-6 py-3 flex items-baseline justify-between text-sm ${
                                              j > 0
                                                ? 'border-t border-stone-100'
                                                : ''
                                            }`}
                                          >
                                            <span className="text-stone-500 text-sm font-medium w-24 flex-shrink-0">
                                              {MEAL_LABELS[j] ??
                                                `Meal ${j + 1}`}
                                            </span>
                                            <span className="text-stone-800 flex-1 ml-4 font-mono text-xs">
                                              {meal.recipeId}
                                            </span>
                                            <span className="text-stone-400 text-xs ml-4">
                                              &times;{meal.servings}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
