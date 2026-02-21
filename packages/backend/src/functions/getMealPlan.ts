import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { ApiResponse, MealPlan } from '@mealplanner/shared/src/types';
import { query } from '../services/db';
import { getMealPlanSchema, validateInput } from '../services/validation';

interface MealPlanRow extends Record<string, unknown> {
  id: string;
  user_id: string;
  week_start: Date;
  created_at: Date;
  updated_at: Date;
}

interface MealPlanDayRecipeRow extends Record<string, unknown> {
  day_id: string;
  day_date: Date;
  recipe_id: string;
  servings: number;
  recipe_name: string;
  recipe_description: string;
  recipe_image_url: string | null;
  recipe_cooking_time_minutes: number;
  recipe_macronutrients: Record<string, unknown>;
}

export async function getMealPlan(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const mealPlanId = request.query.get('id');

    if (!mealPlanId) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Meal plan ID is required',
        } as ApiResponse,
      };
    }

    // Validate input
    const validation = validateInput(getMealPlanSchema, { id: mealPlanId });
    if (!validation.success) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Invalid meal plan ID format',
          message: validation.errors.errors.map((e) => e.message).join(', '),
        } as ApiResponse,
      };
    }

    context.log(`Get meal plan request for id: ${mealPlanId}`);

    // Fetch meal plan
    const planResult = await query<MealPlanRow>(
      `SELECT id, user_id, week_start, created_at, updated_at
       FROM meal_plan
       WHERE id = $1`,
      [mealPlanId]
    );

    if (planResult.rows.length === 0) {
      return {
        status: 404,
        jsonBody: {
          success: false,
          error: 'Meal plan not found',
        } as ApiResponse,
      };
    }

    const planRow = planResult.rows[0];

    // Fetch days with full recipe details via JOIN
    const daysRecipesResult = await query<MealPlanDayRecipeRow>(
      `SELECT
         mpd.id AS day_id,
         mpd.date AS day_date,
         mpr.recipe_id,
         mpr.servings,
         r.name AS recipe_name,
         r.description AS recipe_description,
         r.image_url AS recipe_image_url,
         r.cooking_time_minutes AS recipe_cooking_time_minutes,
         r.macronutrients AS recipe_macronutrients
       FROM meal_plan_day mpd
       LEFT JOIN meal_plan_recipe mpr ON mpr.meal_plan_day_id = mpd.id
       LEFT JOIN recipe r ON r.id = mpr.recipe_id
       WHERE mpd.meal_plan_id = $1
       ORDER BY mpd.date ASC`,
      [mealPlanId]
    );

    // Group by day
    const daysMap = new Map<
      string,
      {
        date: Date;
        recipes: {
          recipeId: string;
          servings: number;
          name: string;
          description: string;
          imageUrl: string | null;
          cookingTimeMinutes: number;
          macronutrients: Record<string, unknown>;
        }[];
      }
    >();

    for (const row of daysRecipesResult.rows) {
      if (!daysMap.has(row.day_id)) {
        daysMap.set(row.day_id, {
          date: row.day_date,
          recipes: [],
        });
      }

      // Only add recipe if the LEFT JOIN returned a recipe
      if (row.recipe_id) {
        daysMap.get(row.day_id)!.recipes.push({
          recipeId: row.recipe_id,
          servings: row.servings,
          name: row.recipe_name,
          description: row.recipe_description,
          imageUrl: row.recipe_image_url,
          cookingTimeMinutes: row.recipe_cooking_time_minutes,
          macronutrients: row.recipe_macronutrients,
        });
      }
    }

    // Assemble meal plan
    const mealPlan: MealPlan & {
      days: {
        date: Date;
        recipes: {
          recipeId: string;
          servings: number;
          name: string;
          description: string;
          imageUrl: string | null;
          cookingTimeMinutes: number;
          macronutrients: Record<string, unknown>;
        }[];
      }[];
    } = {
      id: planRow.id,
      userId: planRow.user_id,
      weekStart: planRow.week_start,
      days: Array.from(daysMap.values()),
      createdAt: planRow.created_at,
      updatedAt: planRow.updated_at,
    };

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: mealPlan,
      } as ApiResponse,
    };
  } catch (error) {
    context.error('Error fetching meal plan:', error);
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

app.http('getMealPlan', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: getMealPlan,
});

export default getMealPlan;
