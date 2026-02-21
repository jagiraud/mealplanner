import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { ApiResponse, Recipe } from '@mealplanner/shared/src/types';
import { query } from '../services/db';
import { getFavouritesSchema, validateInput } from '../services/validation';

interface FavouriteRecipeRow extends Record<string, unknown> {
  id: string;
  name: string;
  description: string;
  cooking_time_minutes: number;
  macronutrients: Record<string, unknown>;
  tags: string[];
  image_url: string | null;
  source_url: string | null;
  servings: number | null;
  recipe_category: string[] | null;
  instructions: string[];
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

interface RecipeIngredientRow extends Record<string, unknown> {
  recipe_id: string;
  ingredient_id: string | null;
  name: string | null;
  raw_text: string | null;
  quantity: number | null;
  unit: string | null;
}

export async function getFavourites(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.query.get('userId');

    if (!userId) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'User ID is required',
        } as ApiResponse,
      };
    }

    // Validate input
    const validation = validateInput(getFavouritesSchema, { userId });
    if (!validation.success) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Invalid user ID format',
          message: validation.errors.errors.map((e) => e.message).join(', '),
        } as ApiResponse,
      };
    }

    context.log(`Get favourites request for user: ${userId}`);

    // Fetch favourite recipes
    const recipesResult = await query<FavouriteRecipeRow>(
      `SELECT r.id, r.name, r.description, r.cooking_time_minutes,
              r.macronutrients, r.tags, r.image_url, r.source_url,
              r.servings, r.recipe_category, r.instructions,
              r.created_by, r.created_at, r.updated_at
       FROM recipe_rating rr
       JOIN recipe r ON r.id = rr.recipe_id
       WHERE rr.user_id = $1 AND rr.favorite = TRUE`,
      [userId]
    );

    if (recipesResult.rows.length === 0) {
      return {
        status: 200,
        jsonBody: {
          success: true,
          data: [],
        } as ApiResponse<Recipe[]>,
      };
    }

    // Fetch ingredients for all favourite recipes
    const recipeIds = recipesResult.rows.map((r) => r.id);
    const ingredientsResult = await query<RecipeIngredientRow>(
      `SELECT recipe_id, ingredient_id, name, raw_text, quantity, unit
       FROM recipe_ingredient
       WHERE recipe_id = ANY($1)`,
      [recipeIds]
    );

    // Group ingredients by recipe_id
    const ingredientsByRecipe = new Map<string, RecipeIngredientRow[]>();
    for (const ing of ingredientsResult.rows) {
      const existing = ingredientsByRecipe.get(ing.recipe_id) || [];
      existing.push(ing);
      ingredientsByRecipe.set(ing.recipe_id, existing);
    }

    // Transform to Recipe type
    const recipes: Recipe[] = recipesResult.rows.map((row) => {
      const ingredients = ingredientsByRecipe.get(row.id) || [];
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        ingredients: ingredients.map((ing) => ({
          ingredientId: ing.ingredient_id || undefined,
          name: ing.name || undefined,
          rawText: ing.raw_text || undefined,
          quantity: ing.quantity || undefined,
          unit: ing.unit || undefined,
        })),
        instructions: row.instructions || [],
        cookingTimeMinutes: row.cooking_time_minutes,
        macronutrients: row.macronutrients as Record<string, number>,
        tags: row.tags,
        imageUrl: row.image_url || undefined,
        sourceUrl: row.source_url || undefined,
        servings: row.servings || undefined,
        recipeCategory: row.recipe_category || undefined,
        createdBy: row.created_by || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: recipes,
      } as ApiResponse<Recipe[]>,
    };
  } catch (error) {
    context.error('Error fetching favourites:', error);
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: 'Internal server error',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      } as ApiResponse,
    };
  }
}

app.http('getFavourites', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: getFavourites,
});

export default getFavourites;
