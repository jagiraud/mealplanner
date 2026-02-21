import type { MealPlan, ApiResponse } from '@mealplanner/shared';
import client from './client';

export async function getMealPlans(
  userId: string
): Promise<ApiResponse<MealPlan[]>> {
  const { data } = await client.get<ApiResponse<MealPlan[]>>('/getMealPlans', {
    params: { userId },
  });
  return data;
}

export async function getMealPlan(id: string): Promise<ApiResponse<MealPlan>> {
  const { data } = await client.get<ApiResponse<MealPlan>>('/getMealPlan', {
    params: { id },
  });
  return data;
}
