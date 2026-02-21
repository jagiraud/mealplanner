import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { ApiResponse, RecipeRating } from '@mealplanner/shared/src/types';
import { query } from '../services/db';
import { rateRecipeSchema, validateInput } from '../services/validation';

interface RecipeRatingRow extends Record<string, unknown> {
  recipe_id: string;
  user_id: string;
  rating: number;
  favorite: boolean;
  comment: string | null;
  created_at: Date;
}

export async function rateRecipe(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    // Validate input
    const validation = validateInput(rateRecipeSchema, body);
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

    const { userId, recipeId, rating, comment } = validation.data;

    context.log(
      `Rate recipe request for user: ${userId}, recipe: ${recipeId}, rating: ${rating}`
    );

    // UPSERT: insert or update the rating and comment
    const result = await query<RecipeRatingRow>(
      `INSERT INTO recipe_rating (recipe_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (recipe_id, user_id)
       DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
       RETURNING recipe_id, user_id, rating, favorite, comment, created_at`,
      [recipeId, userId, rating, comment || null]
    );

    const row = result.rows[0];

    const recipeRating: RecipeRating = {
      userId: row.user_id,
      rating: row.rating,
      favorite: row.favorite,
      comment: row.comment || undefined,
      createdAt: row.created_at,
    };

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: recipeRating,
      } as ApiResponse<RecipeRating>,
    };
  } catch (error) {
    context.error('Error rating recipe:', error);
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

app.http('rateRecipe', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: rateRecipe,
});

export default rateRecipe;
