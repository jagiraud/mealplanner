import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';
import type { Recipe } from '@mealplanner/shared';
import { searchRecipes } from '../api/recipes';
import RecipeCard from '../components/RecipeCard';

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

export default function HomePage() {
  const shouldReduceMotion = useReducedMotion();
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    searchRecipes({ limit: 6 })
      .then((res) => {
        if (res.success && res.data) setFeaturedRecipes(res.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero — blobs + headline + CTAs */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 pt-24 overflow-hidden">
        {/* Background blobs */}
        <motion.div
          className="absolute top-10 left-10 w-[500px] h-[500px] bg-[#FFE4E1] rounded-full opacity-60 blur-[120px]"
          animate={shouldReduceMotion ? undefined : { y: [0, -10, 0, 10, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#E6E6FA] rounded-full opacity-60 blur-[100px]"
          animate={shouldReduceMotion ? undefined : { y: [0, 10, 0, -10, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />

        {/* Content */}
        <motion.div
          initial={shouldReduceMotion ? false : 'hidden'}
          animate={shouldReduceMotion ? false : 'visible'}
          variants={stagger}
          className="relative z-10"
        >
          <motion.h1
            variants={shouldReduceMotion ? undefined : reveal}
            className="text-5xl sm:text-7xl font-bold tracking-tight text-stone-900"
          >
            Plan meals you&rsquo;ll{' '}
            <span className="font-cursive text-pine-500 text-7xl sm:text-8xl">
              actually
            </span>{' '}
            love
          </motion.h1>
          <motion.p
            variants={shouldReduceMotion ? undefined : reveal}
            className="text-base sm:text-lg text-stone-500 leading-relaxed max-w-md mx-auto mt-6"
          >
            Discover recipes, plan your week, and cook with confidence.
          </motion.p>
          <motion.div
            variants={shouldReduceMotion ? undefined : reveal}
            className="flex flex-col sm:flex-row gap-4 mt-10 justify-center"
          >
            <Link
              to="/recipes"
              className="bg-pine-500 text-white rounded-full px-8 py-3.5 font-medium shadow-[0_4px_20px_-2px_rgba(19,132,38,0.25)] hover:bg-pine-600 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2"
            >
              Browse recipes
            </Link>
            <Link
              to="/meal-plan"
              className="bg-white text-stone-700 rounded-full px-8 py-3.5 font-medium border border-stone-200 hover:border-stone-300 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2"
            >
              Plan my week
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured recipes */}
      {featuredRecipes.length > 0 && (
        <motion.section
          initial={shouldReduceMotion ? false : 'hidden'}
          whileInView={shouldReduceMotion ? false : 'visible'}
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24"
        >
          <motion.h2
            variants={shouldReduceMotion ? undefined : reveal}
            className="text-3xl font-semibold tracking-tight text-stone-900 mb-2"
          >
            Popular recipes
          </motion.h2>
          <motion.p
            variants={shouldReduceMotion ? undefined : reveal}
            className="text-base text-stone-500 mb-10"
          >
            Discover what to cook this week.
          </motion.p>

          <motion.div
            initial={shouldReduceMotion ? false : 'hidden'}
            animate={shouldReduceMotion ? false : 'show'}
            variants={gridVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {featuredRecipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                variants={shouldReduceMotion ? undefined : itemVariants}
              >
                <RecipeCard recipe={recipe} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={shouldReduceMotion ? undefined : reveal}
            className="text-center mt-10"
          >
            <Link
              to="/recipes"
              className="text-pine-600 font-medium hover:text-pine-700 transition-colors"
            >
              View all recipes &rarr;
            </Link>
          </motion.div>
        </motion.section>
      )}

      {/* Upcoming meals / empty state */}
      <motion.section
        initial={shouldReduceMotion ? false : 'hidden'}
        whileInView={shouldReduceMotion ? false : 'visible'}
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
        className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24"
      >
        <motion.h2
          variants={shouldReduceMotion ? undefined : reveal}
          className="text-3xl font-semibold tracking-tight text-stone-900 mb-2"
        >
          Your upcoming meals
        </motion.h2>
        <motion.p
          variants={shouldReduceMotion ? undefined : reveal}
          className="text-base text-stone-500 mb-10"
        >
          What&rsquo;s cooking this week.
        </motion.p>

        {/* Empty state */}
        <motion.div
          variants={shouldReduceMotion ? undefined : reveal}
          className="flex flex-col items-center justify-center py-16"
        >
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
                Plan your meals now
              </span>
            </Link>
          </motion.div>
          <p className="text-base text-stone-500 mt-8 text-center max-w-sm">
            No meals planned yet &mdash; let&rsquo;s fix that.
          </p>
        </motion.div>
      </motion.section>
    </div>
  );
}
