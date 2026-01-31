import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { ApiResponse, Recipe } from '@mealplanner/shared/src/types';
import { query } from '../services/db';
import { getRecipeSchema, validateInput } from '../services/validation';

interface RecipeRow extends Record<string, unknown> {
  id: string;
  name: string;
  description: string;
  cooking_time_minutes: number;
  macronutrients: Record<string, unknown>;
  tags: string[];
  image_url: string | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

interface RecipeIngredientRow extends Record<string, unknown> {
  ingredient_id: string;
  name: string;
  quantity: number;
  unit: string;
}

export async function getRecipe(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const recipeId = request.query.get('id');

    if (!recipeId) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Recipe ID is required',
        } as ApiResponse,
      };
    }

    // Validate input
    const validation = validateInput(getRecipeSchema, { id: recipeId });
    if (!validation.success) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Invalid recipe ID format',
          message: validation.errors.errors.map((e) => e.message).join(', '),
        } as ApiResponse,
      };
    }

    context.log(`Get recipe request for id: ${recipeId}`);

    // Fetch recipe
    const recipeResult = await query<RecipeRow>(
      `SELECT id, name, description, cooking_time_minutes, macronutrients, 
              tags, image_url, created_by, created_at, updated_at
       FROM recipe 
       WHERE id = $1`,
      [recipeId]
    );

    if (recipeResult.rows.length === 0) {
      return {
        status: 404,
        jsonBody: {
          success: false,
          error: 'Recipe not found',
        } as ApiResponse,
      };
    }

    const recipeRow = recipeResult.rows[0];

    // Fetch recipe ingredients
    const ingredientsResult = await query<RecipeIngredientRow>(
      `SELECT ingredient_id, name, quantity, unit
       FROM recipe_ingredient
       WHERE recipe_id = $1`,
      [recipeId]
    );

    // Transform to Recipe type
    const recipe: Recipe = {
      id: recipeRow.id,
      name: recipeRow.name,
      description: recipeRow.description,
      ingredients: ingredientsResult.rows.map((ing) => ({
        ingredientId: ing.ingredient_id,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
      })),
      instructions: [], // TODO: Add instructions field to schema
      cookingTimeMinutes: recipeRow.cooking_time_minutes,
      macronutrients: recipeRow.macronutrients as Record<string, number>,
      tags: recipeRow.tags,
      imageUrl: recipeRow.image_url || undefined,
      createdBy: recipeRow.created_by,
      createdAt: recipeRow.created_at,
      updatedAt: recipeRow.updated_at,
    };

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: recipe,
      } as ApiResponse<Recipe>,
    };
  } catch (error) {
    context.error('Error fetching recipe:', error);
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

app.http('getRecipe', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: getRecipe,
});

export default getRecipe;
