import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { MealPlan } from '@mealplanner/shared';
import { generateMealPlan } from '../api/mealPlan';
import LoadingSpinner from '../components/LoadingSpinner';

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

const MEAL_LABELS = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Supper',
  'Late snack',
];

interface FormValues {
  userId: string;
  daysCount: number;
  mealsPerDay: number;
  targetCalories: string;
  dietaryPreferences: string[];
  allergies: string;
}

export default function MealPlanPage() {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { daysCount: 7, mealsPerDay: 3, dietaryPreferences: [] },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);
    setMealPlan(null);
    try {
      const result = await generateMealPlan({
        userId: values.userId.trim(),
        daysCount: Number(values.daysCount),
        mealsPerDay: Number(values.mealsPerDay),
        targetCalories: values.targetCalories
          ? Number(values.targetCalories)
          : undefined,
        dietaryPreferences: values.dietaryPreferences.length
          ? values.dietaryPreferences
          : undefined,
        allergies: values.allergies
          ? values.allergies
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
      });
      if (result.success && result.data) {
        setMealPlan(result.data);
      } else {
        setError(result.error ?? 'Failed to generate meal plan');
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
          Plan your meals
        </h1>
        <p className="text-base text-stone-500 leading-relaxed">
          Generate a weekly plan built around your targets and preferences.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-6 sm:p-8 mb-10 space-y-5"
      >
        <div>
          <label className={labelClass}>
            User ID <span className="text-red-400">*</span>
          </label>
          <input
            {...register('userId', { required: 'User ID is required' })}
            placeholder="550e8400-e29b-41d4-a716-446655440000"
            autoComplete="off"
            spellCheck={false}
            className={`${inputClass} font-mono text-xs`}
          />
          {errors.userId && (
            <p className="text-red-400 text-xs mt-1.5">
              {errors.userId.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Days (1–14)</label>
            <input
              {...register('daysCount')}
              type="number"
              min={1}
              max={14}
              autoComplete="off"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Meals per day (1–6)</label>
            <input
              {...register('mealsPerDay')}
              type="number"
              min={1}
              max={6}
              autoComplete="off"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Target calories / day</label>
            <input
              {...register('targetCalories')}
              type="number"
              min={1}
              placeholder="optional"
              autoComplete="off"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>
            Allergies{' '}
            <span className="text-stone-400 font-normal">
              (comma-separated)
            </span>
          </label>
          <input
            {...register('allergies')}
            placeholder="e.g. peanuts, shellfish"
            autoComplete="off"
            className={inputClass}
          />
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
            {loading ? 'Generating…' : 'Generate plan'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 text-red-600 rounded-2xl px-5 py-4 mb-8 text-sm">
          {error}
        </div>
      )}

      {loading && <LoadingSpinner />}

      {!loading && mealPlan && (
        <div className="pb-16">
          <h2 className="text-lg font-semibold text-stone-900 mb-5">
            Your plan
          </h2>
          <div className="space-y-4">
            {mealPlan.days.map((day, i) => {
              const label = new Date(day.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              });
              return (
                <div
                  key={i}
                  className="bg-white rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-stone-100">
                    <h3 className="text-xs font-medium text-stone-400">
                      {label}
                    </h3>
                  </div>
                  <ul>
                    {day.recipes.map((meal, j) => (
                      <li
                        key={j}
                        className={`px-6 py-3 flex items-baseline justify-between text-sm ${
                          j > 0 ? 'border-t border-stone-100' : ''
                        }`}
                      >
                        <span className="text-stone-500 text-sm font-medium w-24 flex-shrink-0">
                          {MEAL_LABELS[j] ?? `Meal ${j + 1}`}
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
        </div>
      )}
    </div>
  );
}
