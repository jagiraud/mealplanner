import { z } from 'zod';

// Recipe search validation
export const searchRecipesSchema = z.object({
  name: z.string().optional(),
  ingredient: z.string().optional(),
  tags: z.array(z.string()).optional(),
  maxCookingTime: z.number().positive().optional(),
  minProtein: z.number().nonnegative().optional(),
  maxCalories: z.number().positive().optional(),
  dietaryPreferences: z
    .array(
      z.enum([
        'vegetarian',
        'vegan',
        'keto',
        'paleo',
        'gluten-free',
        'dairy-free',
        'low-carb',
        'mediterranean',
      ])
    )
    .optional(),
  excludeIngredients: z.array(z.string()).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type SearchRecipesInput = z.infer<typeof searchRecipesSchema>;

// Get recipe validation
export const getRecipeSchema = z.object({
  id: z.string().uuid('Invalid recipe ID format'),
});

export type GetRecipeInput = z.infer<typeof getRecipeSchema>;

// Generate meal plan validation
export const generateMealPlanSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  weekStart: z.string().datetime().optional(),
  daysCount: z.number().int().min(1).max(14).default(7),
  mealsPerDay: z.number().int().min(1).max(6).default(3),
  targetCalories: z.number().positive().optional(),
  dietaryPreferences: z
    .array(
      z.enum([
        'vegetarian',
        'vegan',
        'keto',
        'paleo',
        'gluten-free',
        'dairy-free',
        'low-carb',
        'mediterranean',
      ])
    )
    .optional(),
  allergies: z.array(z.string()).optional(),
  excludeRecipes: z.array(z.string().uuid()).optional(),
});

export type GenerateMealPlanInput = z.infer<typeof generateMealPlanSchema>;

// Get meal plans validation (list by user)
export const getMealPlansSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

export type GetMealPlansInput = z.infer<typeof getMealPlansSchema>;

// Get single meal plan validation
export const getMealPlanSchema = z.object({
  id: z.string().uuid('Invalid meal plan ID format'),
});

export type GetMealPlanInput = z.infer<typeof getMealPlanSchema>;

// Toggle favourite validation
export const toggleFavouriteSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  recipeId: z.string().uuid('Invalid recipe ID format'),
});

export type ToggleFavouriteInput = z.infer<typeof toggleFavouriteSchema>;

// Rate recipe validation
export const rateRecipeSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  recipeId: z.string().uuid('Invalid recipe ID format'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export type RateRecipeInput = z.infer<typeof rateRecipeSchema>;

// Get favourites validation
export const getFavouritesSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

export type GetFavouritesInput = z.infer<typeof getFavouritesSchema>;

// Dietary preference enum for reuse
const dietaryPreferenceTypeEnum = z.enum([
  'vegetarian',
  'vegan',
  'keto',
  'paleo',
  'gluten-free',
  'dairy-free',
  'low-carb',
  'mediterranean',
]);

// Dietary preference object schema
const dietaryPreferenceSchema = z.object({
  type: dietaryPreferenceTypeEnum,
  strict: z.boolean(),
});

// Macronutrient goals schema
const macronutrientGoalsSchema = z.object({
  caloriesPerDay: z.number().positive().optional(),
  proteinGrams: z.number().nonnegative().optional(),
  carbsGrams: z.number().nonnegative().optional(),
  fatGrams: z.number().nonnegative().optional(),
  fiberGrams: z.number().nonnegative().optional(),
});

// Get profile validation
export const getProfileSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

export type GetProfileInput = z.infer<typeof getProfileSchema>;

// Update profile validation
export const updateProfileSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  dietaryPreferences: z.array(dietaryPreferenceSchema).optional(),
  allergies: z.array(z.string()).optional(),
  macronutrientGoals: macronutrientGoalsSchema.optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Validation helper
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}
