import type { Recipe, ApiResponse } from '@mealplanner/shared';
import client from './client';

export interface SearchRecipesParams {
  name?: string;
  ingredient?: string;
  tags?: string[];
  maxCookingTime?: number;
  minProtein?: number;
  maxCalories?: number;
  dietaryPreferences?: string[];
  excludeIngredients?: string[];
  page?: number;
  limit?: number;
}

export async function searchRecipes(
  params: SearchRecipesParams
): Promise<ApiResponse<Recipe[]>> {
  const query: Record<string, string> = {};
  if (params.name) query.name = params.name;
  if (params.ingredient) query.ingredient = params.ingredient;
  if (params.maxCookingTime != null)
    query.maxCookingTime = String(params.maxCookingTime);
  if (params.minProtein != null) query.minProtein = String(params.minProtein);
  if (params.maxCalories != null)
    query.maxCalories = String(params.maxCalories);
  if (params.page != null) query.page = String(params.page);
  if (params.limit != null) query.limit = String(params.limit);
  if (params.tags?.length) query.tags = params.tags.join(',');
  if (params.dietaryPreferences?.length)
    query.dietaryPreferences = params.dietaryPreferences.join(',');
  if (params.excludeIngredients?.length)
    query.excludeIngredients = params.excludeIngredients.join(',');

  const { data } = await client.get<ApiResponse<Recipe[]>>('/searchRecipes', {
    params: query,
  });
  return data;
}

export async function getRecipe(id: string): Promise<ApiResponse<Recipe>> {
  const { data } = await client.get<ApiResponse<Recipe>>('/getRecipe', {
    params: { id },
  });
  return data;
}
