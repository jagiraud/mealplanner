import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Flame, Dumbbell, Wheat, Droplets, Heart } from 'lucide-react';
import type { Recipe } from '@mealplanner/shared';
import { getRecipe } from '../api/recipes';
import { toggleFavourite } from '../api/favourites';
import LoadingSpinner from '../components/LoadingSpinner';

const FOOD_PHOTOS = [
  'photo-1490645935967-10de6ba17061',
  'photo-1504674900247-0877df9cc836',
  'photo-1512621776951-a57141f2eefd',
  'photo-1567620905732-2d1ec7ab7445',
  'photo-1546069901-ba9599a7e63c',
  'photo-1555939594-58d7cb561ad1',
  'photo-1565299624946-b28f40a0ae38',
  'photo-1482049016688-2d3e1b311543',
  'photo-1498837167922-ddd27525d352',
  'photo-1540189549336-e6e99c3679fe',
];

function heroImage(id: string) {
  const idx =
    parseInt(id.replace(/-/g, '').slice(0, 8), 16) % FOOD_PHOTOS.length;
  return `https://images.unsplash.com/${FOOD_PHOTOS[idx]}?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=1400&h=600&q=80`;
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs font-medium text-stone-500 mb-0.5">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium text-stone-900">{value}</p>
    </div>
  );
}

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [favouriteLoading, setFavouriteLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getRecipe(id)
      .then((res) => {
        if (res.success && res.data) {
          setRecipe(res.data);
          // Check if current user has favourited this recipe
          const ratings = res.data.ratings;
          if (ratings && ratings.length > 0) {
            setIsFavourite(ratings.some((r) => r.favorite));
          }
        } else {
          setError(res.error ?? 'Recipe not found');
        }
      })
      .catch(() => setError('Could not load recipe.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleToggleFavourite() {
    if (!id || favouriteLoading) return;
    setFavouriteLoading(true);
    try {
      // Using a placeholder userId until auth is implemented
      const result = await toggleFavourite('current-user', id);
      if (result.success && result.data) {
        setIsFavourite(result.data.favourite);
      }
    } catch {
      // Optimistic toggle on network error for better UX
      setIsFavourite((prev) => !prev);
    } finally {
      setFavouriteLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 py-16">
        <p className="text-stone-500 mb-4">{error}</p>
        <Link
          to="/recipes"
          className="text-sm font-medium text-pine-500 hover:text-pine-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2"
        >
          &larr; Back to recipes
        </Link>
      </div>
    );
  }

  if (!recipe) return null;

  const macros = recipe.macronutrients;
  const imageSrc = recipe.imageUrl ?? heroImage(recipe.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24">
      {/* Contained hero image */}
      <div className="rounded-3xl overflow-hidden shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] mb-8">
        <img
          src={imageSrc}
          alt={recipe.name}
          width={1400}
          height={600}
          fetchPriority="high"
          className="w-full h-72 sm:h-[420px] object-cover"
        />
      </div>

      {/* Content */}
      <div className="max-w-2xl pb-16">
        <Link
          to="/recipes"
          className="text-sm font-medium text-stone-500 hover:text-pine-500 transition-colors mb-8 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2"
        >
          &larr; Recipes
        </Link>

        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            {recipe.name}
          </h1>
          <motion.button
            type="button"
            onClick={handleToggleFavourite}
            disabled={favouriteLoading}
            whileTap={{ scale: 0.85 }}
            className={`flex-shrink-0 mt-1 p-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2 ${
              isFavourite
                ? 'text-red-500 hover:text-red-600'
                : 'text-stone-300 hover:text-red-400'
            } ${favouriteLoading ? 'opacity-40' : ''}`}
            aria-label={
              isFavourite ? 'Remove from favourites' : 'Add to favourites'
            }
          >
            <Heart
              size={22}
              fill={isFavourite ? 'currentColor' : 'none'}
              strokeWidth={isFavourite ? 0 : 2}
            />
          </motion.button>
        </div>
        <p className="text-stone-500 leading-relaxed mb-8">
          {recipe.description}
        </p>

        <div className="flex flex-wrap gap-5 mb-6 pb-6 border-b border-stone-100">
          <Stat
            icon={<Clock size={14} aria-hidden="true" />}
            label="Cook time"
            value={`${recipe.cookingTimeMinutes} min`}
          />
          {macros?.caloriesPerDay != null && (
            <Stat
              icon={<Flame size={14} aria-hidden="true" />}
              label="Calories"
              value={`${macros.caloriesPerDay} kcal`}
            />
          )}
          {macros?.proteinGrams != null && (
            <Stat
              icon={<Dumbbell size={14} aria-hidden="true" />}
              label="Protein"
              value={`${macros.proteinGrams}g`}
            />
          )}
          {macros?.carbsGrams != null && (
            <Stat
              icon={<Wheat size={14} aria-hidden="true" />}
              label="Carbs"
              value={`${macros.carbsGrams}g`}
            />
          )}
          {macros?.fatGrams != null && (
            <Stat
              icon={<Droplets size={14} aria-hidden="true" />}
              label="Fat"
              value={`${macros.fatGrams}g`}
            />
          )}
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-8">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="bg-sage text-stone-700 rounded-full px-3 py-1 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">
              Ingredients
            </h2>
            <div className="bg-white rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {recipe.ingredients.map((ing, i) => (
                    <tr
                      key={ing.ingredientId ?? i}
                      className={i > 0 ? 'border-t border-stone-100' : ''}
                    >
                      {ing.name && ing.quantity != null ? (
                        <>
                          <td className="px-5 py-3 text-stone-800">
                            {ing.name}
                          </td>
                          <td className="px-5 py-3 text-right text-stone-500 tabular-nums">
                            {ing.quantity}
                          </td>
                          <td className="px-5 py-3 text-right text-stone-400 w-16">
                            {ing.unit}
                          </td>
                        </>
                      ) : (
                        <td colSpan={3} className="px-5 py-3 text-stone-800">
                          {ing.rawText ?? ing.name}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {recipe.instructions && recipe.instructions.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">
              Instructions
            </h2>
            <ol className="space-y-4">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 text-xs font-medium text-stone-400 w-5 pt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-stone-700 text-sm leading-relaxed">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {recipe.sourceUrl && (
          <p className="text-xs text-stone-400 pb-16">
            Recipe source:{' '}
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-stone-600 transition-colors"
            >
              {new URL(recipe.sourceUrl).hostname}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
