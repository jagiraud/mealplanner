import type { UserProfile, ApiResponse } from '@mealplanner/shared';
import client from './client';

export async function getProfile(
  userId: string
): Promise<ApiResponse<UserProfile>> {
  const { data } = await client.get<ApiResponse<UserProfile>>('/getProfile', {
    params: { userId },
  });
  return data;
}

export interface UpdateProfileRequest {
  userId: string;
  firstName: string;
  lastName: string;
  dietaryPreferences: string[];
  allergies: string[];
  macronutrientGoals: {
    caloriesPerDay?: number;
    proteinGrams?: number;
    carbsGrams?: number;
    fatGrams?: number;
  };
}

export async function updateProfile(
  body: UpdateProfileRequest
): Promise<ApiResponse<UserProfile>> {
  const { data } = await client.put<ApiResponse<UserProfile>>(
    '/updateProfile',
    body
  );
  return data;
}
