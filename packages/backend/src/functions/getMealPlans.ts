import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { ApiResponse, MealPlan } from '@mealplanner/shared/src/types';
import { query } from '../services/db';
import { getMealPlansSchema, validateInput } from '../services/validation';

interface MealPlanRow extends Record<string, unknown> {
  id: string;
  user_id: string;
  week_start: Date;
  created_at: Date;
  updated_at: Date;
}

interface MealPlanDayRow extends Record<string, unknown> {
  id: string;
  meal_plan_id: string;
  date: Date;
}

interface MealPlanRecipeRow extends Record<string, unknown> {
  meal_plan_day_id: string;
  recipe_id: string;
  servings: number;
}

export async function getMealPlans(
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
    const validation = validateInput(getMealPlansSchema, { userId });
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

    context.log(`Get meal plans request for userId: ${userId}`);

    // Fetch meal plans for the user
    const plansResult = await query<MealPlanRow>(
      `SELECT id, user_id, week_start, created_at, updated_at
       FROM meal_plan
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    if (plansResult.rows.length === 0) {
      return {
        status: 200,
        jsonBody: {
          success: true,
          data: [],
          message: 'No meal plans found for this user',
        } as ApiResponse<MealPlan[]>,
      };
    }

    const planIds = plansResult.rows.map((p) => p.id);

    // Fetch all days for these meal plans
    const daysResult = await query<MealPlanDayRow>(
      `SELECT id, meal_plan_id, date
       FROM meal_plan_day
       WHERE meal_plan_id = ANY($1::uuid[])
       ORDER BY date ASC`,
      [planIds]
    );

    const dayIds = daysResult.rows.map((d) => d.id);

    // Fetch all recipes for these days (IDs and servings only)
    let recipesResult: { rows: MealPlanRecipeRow[] } = { rows: [] };
    if (dayIds.length > 0) {
      recipesResult = await query<MealPlanRecipeRow>(
        `SELECT meal_plan_day_id, recipe_id, servings
         FROM meal_plan_recipe
         WHERE meal_plan_day_id = ANY($1::uuid[])`,
        [dayIds]
      );
    }

    // Group recipes by day
    const recipesByDay = new Map<string, MealPlanRecipeRow[]>();
    for (const recipe of recipesResult.rows) {
      const dayId = recipe.meal_plan_day_id;
      if (!recipesByDay.has(dayId)) {
        recipesByDay.set(dayId, []);
      }
      recipesByDay.get(dayId)!.push(recipe);
    }

    // Group days by meal plan
    const daysByPlan = new Map<string, MealPlanDayRow[]>();
    for (const day of daysResult.rows) {
      const planId = day.meal_plan_id;
      if (!daysByPlan.has(planId)) {
        daysByPlan.set(planId, []);
      }
      daysByPlan.get(planId)!.push(day);
    }

    // Assemble meal plans
    const mealPlans: MealPlan[] = plansResult.rows.map((plan) => ({
      id: plan.id,
      userId: plan.user_id,
      weekStart: plan.week_start,
      days: (daysByPlan.get(plan.id) || []).map((day) => ({
        date: day.date,
        recipes: (recipesByDay.get(day.id) || []).map((r) => ({
          recipeId: r.recipe_id,
          servings: r.servings,
        })),
      })),
      createdAt: plan.created_at,
      updatedAt: plan.updated_at,
    }));

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: mealPlans,
        message: `Found ${mealPlans.length} meal plans`,
      } as ApiResponse<MealPlan[]>,
    };
  } catch (error) {
    context.error('Error fetching meal plans:', error);
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

app.http('getMealPlans', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: getMealPlans,
});

export default getMealPlans;
