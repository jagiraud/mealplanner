import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock, Flame, Dumbbell } from 'lucide-react';
import type { Recipe } from '@mealplanner/shared';

// Deterministic food image from Unsplash based on recipe id
function recipePlaceholder(id: string) {
  const FOOD_PHOTOS = [
    'photo-1490645935967-10de6ba17061', // bowl of food
    'photo-1504674900247-0877df9cc836', // plated dish
    'photo-1512621776951-a57141f2eefd', // salad
    'photo-1567620905732-2d1ec7ab7445', // pancakes
    'photo-1546069901-ba9599a7e63c', // salad bowl
    'photo-1555939594-58d7cb561ad1', // fried food
    'photo-1565299624946-b28f40a0ae38', // pizza
    'photo-1482049016688-2d3e1b311543', // eggs
    'photo-1498837167922-ddd27525d352', // vegetables
    'photo-1540189549336-e6e99c3679fe', // colorful dish
  ];
  const idx =
    parseInt(id.replace(/-/g, '').slice(0, 8), 16) % FOOD_PHOTOS.length;
  return `https://images.unsplash.com/${FOOD_PHOTOS[idx]}?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=600&h=400&q=80`;
}

interface Props {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: Props) {
  const imageSrc = recipe.imageUrl ?? recipePlaceholder(recipe.id);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={
        shouldReduceMotion
          ? undefined
          : { y: -4, transition: { duration: 0.3 } }
      }
    >
      <Link
        to={`/recipes/${recipe.id}`}
        className="block bg-white rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-shadow duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2"
      >
        <div className="relative h-44 overflow-hidden">
          <img
            src={imageSrc}
            alt={recipe.name}
            width={600}
            height={400}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-medium text-stone-800 mb-1 line-clamp-1 group-hover:text-pine-700 transition-colors">
            {recipe.name}
          </h3>
          <p className="text-stone-500 text-sm mb-3 line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-stone-400">
            <span className="flex items-center gap-1.5">
              <Clock size={14} aria-hidden="true" />
              {recipe.cookingTimeMinutes} min
            </span>
            {recipe.macronutrients?.caloriesPerDay != null && (
              <span className="flex items-center gap-1.5">
                <Flame size={14} aria-hidden="true" />
                {recipe.macronutrients.caloriesPerDay} kcal
              </span>
            )}
            {recipe.macronutrients?.proteinGrams != null && (
              <span className="flex items-center gap-1.5">
                <Dumbbell size={14} aria-hidden="true" />
                {recipe.macronutrients.proteinGrams}g
              </span>
            )}
          </div>
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {recipe.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-sage text-stone-700 rounded-full px-3 py-1 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
