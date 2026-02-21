import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';
import { getProfile, updateProfile } from '../api/profile';
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

interface FormValues {
  userId: string;
  firstName: string;
  lastName: string;
  dietaryPreferences: string[];
  allergies: string;
  caloriesPerDay: string;
  proteinGrams: string;
  carbsGrams: string;
  fatGrams: string;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      dietaryPreferences: [],
      allergies: '',
      caloriesPerDay: '',
      proteinGrams: '',
      carbsGrams: '',
      fatGrams: '',
    },
  });

  const userId = watch('userId');

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function loadProfile() {
    if (!userId?.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getProfile(userId.trim());
      if (result.success && result.data) {
        const p = result.data;
        setValue('firstName', p.firstName);
        setValue('lastName', p.lastName);
        setValue(
          'dietaryPreferences',
          p.dietaryPreferences.map((d) => d.type)
        );
        setValue('allergies', p.allergies.join(', '));
        if (p.macronutrientGoals.caloriesPerDay != null)
          setValue(
            'caloriesPerDay',
            String(p.macronutrientGoals.caloriesPerDay)
          );
        if (p.macronutrientGoals.proteinGrams != null)
          setValue('proteinGrams', String(p.macronutrientGoals.proteinGrams));
        if (p.macronutrientGoals.carbsGrams != null)
          setValue('carbsGrams', String(p.macronutrientGoals.carbsGrams));
        if (p.macronutrientGoals.fatGrams != null)
          setValue('fatGrams', String(p.macronutrientGoals.fatGrams));
      } else {
        setError(result.error ?? 'Profile not found');
      }
    } catch {
      setError('Could not reach the API. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(values: FormValues) {
    setSaving(true);
    setToast(null);
    try {
      const result = await updateProfile({
        userId: values.userId.trim(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        dietaryPreferences: values.dietaryPreferences,
        allergies: values.allergies
          ? values.allergies
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        macronutrientGoals: {
          caloriesPerDay: values.caloriesPerDay
            ? Number(values.caloriesPerDay)
            : undefined,
          proteinGrams: values.proteinGrams
            ? Number(values.proteinGrams)
            : undefined,
          carbsGrams: values.carbsGrams ? Number(values.carbsGrams) : undefined,
          fatGrams: values.fatGrams ? Number(values.fatGrams) : undefined,
        },
      });
      if (result.success) {
        setToast({ type: 'success', message: 'Profile saved successfully.' });
      } else {
        setToast({
          type: 'error',
          message: result.error ?? 'Failed to save profile.',
        });
      }
    } catch {
      setToast({
        type: 'error',
        message: 'Could not reach the API. Is the backend running?',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      {/* Page heading */}
      <div className="pt-24 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mb-2">
          Profile
        </h1>
        <p className="text-base text-stone-500 leading-relaxed">
          Your dietary preferences and macronutrient goals.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`rounded-2xl px-5 py-4 mb-8 text-sm flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {toast.type === 'success' ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <AlertCircle size={16} aria-hidden="true" />
          )}
          {toast.message}
        </motion.div>
      )}

      {/* Profile form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-6 sm:p-8 mb-10 space-y-5"
      >
        {/* User ID + Load */}
        <div>
          <label className={labelClass}>
            User ID <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-3">
            <input
              {...register('userId', { required: 'User ID is required' })}
              placeholder="550e8400-e29b-41d4-a716-446655440000"
              autoComplete="off"
              spellCheck={false}
              className={`${inputClass} font-mono text-xs flex-1`}
            />
            <button
              type="button"
              onClick={loadProfile}
              disabled={loading || !userId?.trim()}
              className="bg-white text-stone-700 rounded-full px-6 py-3 font-medium border border-stone-200 hover:border-stone-300 disabled:opacity-40 transition-all duration-300 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2 text-sm"
            >
              {loading ? 'Loading...' : 'Load'}
            </button>
          </div>
          {errors.userId && (
            <p className="text-red-400 text-xs mt-1.5">
              {errors.userId.message}
            </p>
          )}
        </div>

        {loading && <LoadingSpinner />}

        {error && (
          <div className="bg-red-50 text-red-600 rounded-2xl px-5 py-4 text-sm">
            {error}
          </div>
        )}

        {/* Name fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First name</label>
            <input
              {...register('firstName')}
              placeholder="Jane"
              autoComplete="given-name"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Last name</label>
            <input
              {...register('lastName')}
              placeholder="Doe"
              autoComplete="family-name"
              className={inputClass}
            />
          </div>
        </div>

        {/* Dietary preferences */}
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

        {/* Allergies */}
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

        {/* Macronutrient goals */}
        <div>
          <p className={labelClass}>Macronutrient goals</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Calories / day</label>
              <input
                {...register('caloriesPerDay')}
                type="number"
                min={1}
                placeholder="e.g. 2000"
                autoComplete="off"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Protein (g)</label>
              <input
                {...register('proteinGrams')}
                type="number"
                min={0}
                placeholder="e.g. 150"
                autoComplete="off"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Carbs (g)</label>
              <input
                {...register('carbsGrams')}
                type="number"
                min={0}
                placeholder="e.g. 250"
                autoComplete="off"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Fat (g)</label>
              <input
                {...register('fatGrams')}
                type="number"
                min={0}
                placeholder="e.g. 65"
                autoComplete="off"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={saving}
            className="bg-stone-900 text-white rounded-full px-8 py-3 font-medium hover:bg-stone-800 disabled:opacity-40 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2"
          >
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </form>

      <div className="pb-16" />
    </div>
  );
}
