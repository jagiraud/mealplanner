import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { ApiResponse } from '@mealplanner/shared/src/types';
import { query } from '../services/db';
import { toggleFavouriteSchema, validateInput } from '../services/validation';

interface RecipeRatingRow extends Record<string, unknown> {
  recipe_id: string;
  user_id: string;
  favorite: boolean;
}

export async function toggleFavourite(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    // Validate input
    const validation = validateInput(toggleFavouriteSchema, body);
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

    const { userId, recipeId } = validation.data;

    context.log(
      `Toggle favourite request for user: ${userId}, recipe: ${recipeId}`
    );

    // UPSERT: insert or toggle the favorite flag
    const result = await query<RecipeRatingRow>(
      `INSERT INTO recipe_rating (recipe_id, user_id, favorite)
       VALUES ($1, $2, TRUE)
       ON CONFLICT (recipe_id, user_id)
       DO UPDATE SET favorite = NOT recipe_rating.favorite
       RETURNING recipe_id, user_id, favorite`,
      [recipeId, userId]
    );

    const row = result.rows[0];

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: {
          recipeId: row.recipe_id,
          userId: row.user_id,
          favorite: row.favorite,
        },
      } as ApiResponse<{
        recipeId: string;
        userId: string;
        favorite: boolean;
      }>,
    };
  } catch (error) {
    context.error('Error toggling favourite:', error);
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

app.http('toggleFavourite', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: toggleFavourite,
});

export default toggleFavourite;
