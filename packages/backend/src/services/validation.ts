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
