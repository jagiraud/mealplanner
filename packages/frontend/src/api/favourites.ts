import type { Recipe, ApiResponse } from '@mealplanner/shared';
import client from './client';

export async function toggleFavourite(
  userId: string,
  recipeId: string
): Promise<ApiResponse<{ favourite: boolean }>> {
  const { data } = await client.post<ApiResponse<{ favourite: boolean }>>(
    '/toggleFavourite',
    { userId, recipeId }
  );
  return data;
}

export async function getFavourites(
  userId: string
): Promise<ApiResponse<Recipe[]>> {
  const { data } = await client.get<ApiResponse<Recipe[]>>('/getFavourites', {
    params: { userId },
  });
  return data;
}

export async function rateRecipe(
  userId: string,
  recipeId: string,
  rating: number,
  comment?: string
): Promise<ApiResponse<void>> {
  const { data } = await client.post<ApiResponse<void>>('/rateRecipe', {
    userId,
    recipeId,
    rating,
    comment,
  });
  return data;
}
