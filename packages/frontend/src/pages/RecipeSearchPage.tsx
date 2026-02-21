import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Recipe } from '@mealplanner/shared';
import { searchRecipes, type SearchRecipesParams } from '../api/recipes';
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

const DIETARY_OPTIONS = [
  'vegetarian',
  'vegan',
  'keto',
  'paleo',
  'gluten-free',
  'dairy-free',
  'low-carb',
  'mediterranean',
] as const;

const inputClass =
  'w-full bg-stone-50 rounded-full px-5 py-3 text-sm text-stone-700 placeholder:text-stone-400 border-none outline-none focus:ring-2 focus:ring-pine-400 transition-all duration-200';
const labelClass = 'block text-xs font-medium text-stone-500 mb-2';

interface FormValues {
  name: string;
  ingredient: string;
  maxCookingTime: string;
  minProtein: string;
  maxCalories: string;
  dietaryPreferences: string[];
}

export default function RecipeSearchPage() {
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { dietaryPreferences: [] },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);
    try {
      const params: SearchRecipesParams = {};
      if (values.name.trim()) params.name = values.name.trim();
      if (values.ingredient.trim())
        params.ingredient = values.ingredient.trim();
      if (values.maxCookingTime)
        params.maxCookingTime = Number(values.maxCookingTime);
      if (values.minProtein) params.minProtein = Number(values.minProtein);
      if (values.maxCalories) params.maxCalories = Number(values.maxCalories);
      if (values.dietaryPreferences.length)
        params.dietaryPreferences = values.dietaryPreferences;

      const result = await searchRecipes(params);
      if (result.success && result.data) {
        setRecipes(result.data);
      } else {
        setError(result.error ?? 'Search failed');
      }
    } catch {
      setError('Could not reach the API. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      {/* Page heading */}
      <div className="pt-24 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mb-2">
          Browse recipes
        </h1>
        <p className="text-base text-stone-500 leading-relaxed">
          Filter by ingredient, cook time, dietary preference, and macros.
        </p>
      </div>

      {/* Search form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-6 sm:p-8 mb-10 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Recipe name</label>
            <input
              {...register('name')}
              placeholder="e.g. chicken soup"
              autoComplete="off"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Contains ingredient</label>
            <input
              {...register('ingredient')}
              placeholder="e.g. garlic"
              autoComplete="off"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Max cook time (min)</label>
            <input
              {...register('maxCookingTime')}
              type="number"
              min={1}
              placeholder="e.g. 30"
              autoComplete="off"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Max calories</label>
            <input
              {...register('maxCalories')}
              type="number"
              min={1}
              placeholder="e.g. 600"
              autoComplete="off"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Min protein (g)</label>
            <input
              {...register('minProtein')}
              type="number"
              min={0}
              placeholder="e.g. 20"
              autoComplete="off"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <p className={labelClass}>Dietary preferences</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {DIETARY_OPTIONS.map((pref) => (
              <label
                key={pref}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={pref}
                  {...register('dietaryPreferences')}
                  className="accent-pine-500 w-4 h-4"
                />
                <span className="text-sm text-stone-600 capitalize">
                  {pref}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading}
            className="bg-stone-900 text-white rounded-full px-8 py-3 font-medium hover:bg-stone-800 disabled:opacity-40 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2"
          >
            {loading ? 'Searching…' : 'Search recipes'}
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
            <p className="text-sm text-stone-400 mb-5">
              {recipes.length} result{recipes.length !== 1 ? 's' : ''}
            </p>
            {recipes.length === 0 ? (
              <p className="text-stone-400 text-center py-16">
                No recipes found. Try different filters.
              </p>
            ) : (
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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
