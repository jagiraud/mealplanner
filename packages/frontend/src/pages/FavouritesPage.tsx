import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { Recipe } from '@mealplanner/shared';
import { getFavourites } from '../api/favourites';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const inputClass =
  'w-full bg-stone-50 rounded-full px-5 py-3 text-sm text-stone-700 placeholder:text-stone-400 border-none outline-none focus:ring-2 focus:ring-pine-400 transition-all duration-200';
const labelClass = 'block text-xs font-medium text-stone-500 mb-2';

export default function FavouritesPage() {
  const [userId, setUserId] = useState('');
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  async function fetchFavourites(id: string) {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getFavourites(id.trim());
      if (result.success && result.data) {
        setRecipes(result.data);
      } else {
        setError(result.error ?? 'Failed to load favourites');
      }
    } catch {
      setError('Could not reach the API. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchFavourites(userId);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      {/* Page heading */}
      <div className="pt-24 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mb-2">
          Favourites
        </h1>
        <p className="text-base text-stone-500 leading-relaxed">
          Your saved and bookmarked recipes.
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
            {loading ? 'Loading...' : 'Load favourites'}
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
        {!loading && recipes !== null && (
          <motion.div
            initial={shouldReduceMotion ? false : 'hidden'}
            animate={shouldReduceMotion ? false : 'show'}
            variants={gridVariants}
            className="pb-16"
          >
            {recipes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                  <Heart size={24} className="text-stone-400" />
                </div>
                <p className="text-stone-400 text-center max-w-sm">
                  No favourites yet. Browse recipes to find ones you love.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-stone-400 mb-5">
                  {recipes.length} favourite{recipes.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recipes.map((recipe) => (
                    <motion.div
                      key={recipe.id}
                      variants={shouldReduceMotion ? undefined : itemVariants}
                    >
                      <RecipeCard recipe={recipe} />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
