import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { ApiResponse, UserProfile } from '@mealplanner/shared/src/types';
import { query } from '../services/db';
import { updateProfileSchema, validateInput } from '../services/validation';

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

export async function updateProfile(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (!body.userId) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'User ID is required',
        } as ApiResponse,
      };
    }

    // Validate input
    const validation = validateInput(updateProfileSchema, body);
    if (!validation.success) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'Invalid input',
          message: validation.errors.errors.map((e) => e.message).join(', '),
        } as ApiResponse,
      };
    }

    const validatedData = validation.data;

    context.log(`Update profile request for userId: ${validatedData.userId}`);

    // Build dynamic SET clause for only provided fields
    const setClauses: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (validatedData.firstName !== undefined) {
      setClauses.push(`first_name = $${paramIndex++}`);
      params.push(validatedData.firstName);
    }

    if (validatedData.lastName !== undefined) {
      setClauses.push(`last_name = $${paramIndex++}`);
      params.push(validatedData.lastName);
    }

    if (validatedData.dietaryPreferences !== undefined) {
      setClauses.push(`dietary_preferences = $${paramIndex++}`);
      params.push(JSON.stringify(validatedData.dietaryPreferences));
    }

    if (validatedData.allergies !== undefined) {
      setClauses.push(`allergies = $${paramIndex++}`);
      params.push(validatedData.allergies);
    }

    if (validatedData.macronutrientGoals !== undefined) {
      setClauses.push(`macronutrient_goals = $${paramIndex++}`);
      params.push(JSON.stringify(validatedData.macronutrientGoals));
    }

    if (setClauses.length === 0) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          error: 'No fields to update',
        } as ApiResponse,
      };
    }

    // Always update updated_at
    setClauses.push(`updated_at = now()`);

    // Add userId as the last parameter
    params.push(validatedData.userId);

    const updateResult = await query<UserProfileRow>(
      `UPDATE user_profile
       SET ${setClauses.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, email, first_name, last_name, dietary_preferences,
                 allergies, macronutrient_goals, created_at, updated_at`,
      params
    );

    if (updateResult.rows.length === 0) {
      return {
        status: 404,
        jsonBody: {
          success: false,
          error: 'User profile not found',
        } as ApiResponse,
      };
    }

    const profileRow = updateResult.rows[0];

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
    context.error('Error updating profile:', error);
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

app.http('updateProfile', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  handler: updateProfile,
});

export default updateProfile;
