import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { ApiResponse, UserProfile } from '@mealplanner/shared/src/types';
import { query } from '../services/db';
import { getProfileSchema, validateInput } from '../services/validation';

interface UserProfileRow extends Record<string, unknown> {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  dietary_preferences: Record<string, unknown>[];
  allergies: string[];
  macronutrient_goals: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

export async function getProfile(
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
    const validation = validateInput(getProfileSchema, { userId });
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

    context.log(`Get profile request for userId: ${userId}`);

    // Fetch user profile (exclude password_hash)
    const profileResult = await query<UserProfileRow>(
      `SELECT id, email, first_name, last_name, dietary_preferences,
              allergies, macronutrient_goals, created_at, updated_at
       FROM user_profile
       WHERE id = $1`,
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return {
        status: 404,
        jsonBody: {
          success: false,
          error: 'User profile not found',
        } as ApiResponse,
      };
    }

    const profileRow = profileResult.rows[0];

    // Transform to UserProfile type
    const profile: UserProfile = {
      id: profileRow.id,
      email: profileRow.email,
      firstName: profileRow.first_name,
      lastName: profileRow.last_name,
      dietaryPreferences: (profileRow.dietary_preferences || []).map(
        (pref) => ({
          type: pref.type as UserProfile['dietaryPreferences'][0]['type'],
          strict: pref.strict as boolean,
        })
      ),
      allergies: profileRow.allergies || [],
      macronutrientGoals: (profileRow.macronutrient_goals ||
        {}) as UserProfile['macronutrientGoals'],
      createdAt: profileRow.created_at,
      updatedAt: profileRow.updated_at,
    };

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: profile,
      } as ApiResponse<UserProfile>,
    };
  } catch (error) {
    context.error('Error fetching profile:', error);
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

app.http('getProfile', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: getProfile,
});

export default getProfile;
