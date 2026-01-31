import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { ApiResponse, Recipe } from '@mealplanner/shared/src/types';
import { query } from '../services/db';
import {
  searchRecipesSchema,
  validateInput,
  SearchRecipesInput,
} from '../services/validation';

interface RecipeSearchRow extends Record<string, unknown> {
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

export async function searchRecipes(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    context.log('Recipe search request received');

    // Parse request body or query params
    let searchParams: unknown;
    if (request.method === 'POST') {
      searchParams = await request.json();
    } else {
      // Convert query params to object
      const params: Record<string, unknown> = {};
      request.query.forEach((value, key) => {
        if (key === 'tags' || key === 'dietaryPreferences' || key === 'excludeIngredients') {
          params[key] = value.split(',').map((v) => v.trim());
        } else if (
          key === 'maxCookingTime' ||
          key === 'minProtein' ||
          key === 'maxCalories' ||
          key === 'page' ||
          key === 'limit'
        ) {
          params[key] = Number(value);
        } else {
          params[key] = value;
        }
      });
      searchParams = params;
    }

    // Validate input
    const validation = validateInput(searchRecipesSchema, searchParams);
    if (!validation.success) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Invalid search parameters',
          message: validation.errors.errors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join(', '),
        } as ApiResponse,
      };
    }

    const filters = validation.data;

    // Build dynamic SQL query
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (filters.name) {
      conditions.push(`r.name ILIKE $${paramIndex}`);
      values.push(`%${filters.name}%`);
      paramIndex++;
    }

    if (filters.maxCookingTime) {
      conditions.push(`r.cooking_time_minutes <= $${paramIndex}`);
      values.push(filters.maxCookingTime);
      paramIndex++;
    }

    if (filters.tags && filters.tags.length > 0) {
      conditions.push(`r.tags && $${paramIndex}::text[]`);
      values.push(filters.tags);
      paramIndex++;
    }

    if (filters.ingredient) {
      conditions.push(
        `EXISTS (
          SELECT 1 FROM recipe_ingredient ri 
          WHERE ri.recipe_id = r.id 
          AND ri.name ILIKE $${paramIndex}
        )`
      );
      values.push(`%${filters.ingredient}%`);
      paramIndex++;
    }

    if (filters.excludeIngredients && filters.excludeIngredients.length > 0) {
      filters.excludeIngredients.forEach((ing) => {
        conditions.push(
          `NOT EXISTS (
            SELECT 1 FROM recipe_ingredient ri 
            WHERE ri.recipe_id = r.id 
            AND ri.name ILIKE $${paramIndex}
          )`
        );
        values.push(`%${ing}%`);
        paramIndex++;
      });
    }

    if (filters.minProtein) {
      conditions.push(`(r.macronutrients->>'proteinGrams')::numeric >= $${paramIndex}`);
      values.push(filters.minProtein);
      paramIndex++;
    }

    if (filters.maxCalories) {
      conditions.push(
        `(r.macronutrients->>'caloriesPerDay')::numeric <= $${paramIndex}`
      );
      values.push(filters.maxCalories);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Calculate pagination
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;
    values.push(limit, offset);

    const sqlQuery = `
      SELECT r.id, r.name, r.description, r.cooking_time_minutes, 
             r.macronutrients, r.tags, r.image_url, r.created_by, 
             r.created_at, r.updated_at
      FROM recipe r
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await query<RecipeSearchRow>(sqlQuery, values);

    // Transform to Recipe array (simplified without ingredients for search results)
    const recipes: Recipe[] = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      ingredients: [], // Not loaded for search results for performance
      instructions: [],
      cookingTimeMinutes: row.cooking_time_minutes,
      macronutrients: row.macronutrients as any,
      tags: row.tags,
      imageUrl: row.image_url || undefined,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: recipes,
        message: `Found ${recipes.length} recipes`,
      } as ApiResponse<Recipe[]>,
    };
  } catch (error) {
    context.error('Error searching recipes:', error);
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

app.http('searchRecipes', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: searchRecipes,
});

export default searchRecipes;
