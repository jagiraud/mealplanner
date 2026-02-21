import type { MealPlan, ApiResponse } from '@mealplanner/shared';
import client from './client';

export interface GenerateMealPlanRequest {
  userId: string;
  weekStart?: string;
  daysCount?: number;
  mealsPerDay?: number;
  targetCalories?: number;
  dietaryPreferences?: string[];
  allergies?: string[];
  excludeRecipes?: string[];
}

export async function generateMealPlan(
  body: GenerateMealPlanRequest
): Promise<ApiResponse<MealPlan>> {
  const { data } = await client.post<ApiResponse<MealPlan>>(
    '/generateMealPlan',
    body
  );
  return data;
}
