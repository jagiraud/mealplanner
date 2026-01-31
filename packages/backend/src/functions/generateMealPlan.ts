import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { ApiResponse, MealPlan } from '@mealplanner/shared/src/types';
import { query } from '../services/db';
import { generateMealPlanSchema, validateInput } from '../services/validation';

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

export async function generateMealPlan(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    context.log('Meal plan generation request received');

    const requestBody = await request.json();

    // Validate input
    const validation = validateInput(generateMealPlanSchema, requestBody);
    if (!validation.success) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Invalid meal plan parameters',
          message: validation.errors.errors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join(', '),
        } as ApiResponse,
      };
    }

    const params = validation.data;
    const daysCount = params.daysCount ?? 7;
    const mealsPerDay = params.mealsPerDay ?? 3;

    // Build query to get suitable recipes
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    // Filter by dietary preferences
    if (params.dietaryPreferences && params.dietaryPreferences.length > 0) {
      conditions.push(`r.tags && $${paramIndex}::text[]`);
      values.push(params.dietaryPreferences);
      paramIndex++;
    }

    // Exclude recipes with allergens
    if (params.allergies && params.allergies.length > 0) {
      params.allergies.forEach((allergen) => {
        conditions.push(
          `NOT EXISTS (
            SELECT 1 FROM recipe_ingredient ri 
            WHERE ri.recipe_id = r.id 
            AND ri.name ILIKE $${paramIndex}
          )`
        );
        values.push(`%${allergen}%`);
        paramIndex++;
      });
    }

    // Exclude specific recipes
    if (params.excludeRecipes && params.excludeRecipes.length > 0) {
      conditions.push(
        `r.id NOT IN (${params.excludeRecipes.map((_, i) => `$${paramIndex + i}`).join(', ')})`
      );
      params.excludeRecipes.forEach((id) => values.push(id));
      paramIndex += params.excludeRecipes.length;
    }

    // Filter by target calories if specified
    if (params.targetCalories) {
      const calorieRange = params.targetCalories * 0.2; // 20% variance
      conditions.push(
        `(r.macronutrients->>'caloriesPerDay')::numeric BETWEEN $${paramIndex} AND $${paramIndex + 1}`
      );
      values.push(
        params.targetCalories / mealsPerDay - calorieRange,
        params.targetCalories / mealsPerDay + calorieRange
      );
      paramIndex += 2;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Fetch suitable recipes
    const recipesQuery = `
      SELECT r.id, r.name, r.description, r.cooking_time_minutes, 
             r.macronutrients, r.tags, r.image_url, r.created_by, 
             r.created_at, r.updated_at
      FROM recipe r
      ${whereClause}
      ORDER BY RANDOM()
      LIMIT ${daysCount * mealsPerDay}
    `;

    const recipesResult = await query<RecipeRow>(recipesQuery, values);

    if (recipesResult.rows.length === 0) {
      return {
        status: 404,
        jsonBody: {
          success: false,
          error: 'No suitable recipes found',
          message:
            'No recipes match the specified criteria. Try relaxing your filters.',
        } as ApiResponse,
      };
    }

    // Generate meal plan structure
    const weekStart = params.weekStart
      ? new Date(params.weekStart)
      : new Date();
    weekStart.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < daysCount; i++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(dayDate.getDate() + i);

      const dayRecipes = recipesResult.rows
        .slice(i * mealsPerDay, (i + 1) * mealsPerDay)
        .map((recipe) => ({
          recipeId: recipe.id,
          servings: 1,
        }));

      days.push({
        date: dayDate,
        recipes: dayRecipes,
      });
    }

    // Create meal plan object
    const mealPlan: MealPlan = {
      id: crypto.randomUUID(),
      userId: params.userId,
      weekStart,
      days,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // TODO: Persist meal plan to database

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: mealPlan,
        message: `Generated meal plan for ${daysCount} days with ${mealsPerDay} meals per day`,
      } as ApiResponse<MealPlan>,
    };
  } catch (error) {
    context.error('Error generating meal plan:', error);
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

app.http('generateMealPlan', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: generateMealPlan,
});

export default generateMealPlan;
