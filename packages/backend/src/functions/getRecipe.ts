import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { ApiResponse, Recipe } from '@mealplanner/shared/src/types';

// TODO: Implement actual DB fetch logic
export async function getRecipe(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const recipeId = request.query.get('id');

  context.log(`Get recipe request for id: ${recipeId}`);

  return {
    status: 200,
    jsonBody: {
      success: true,
      data: null as Recipe | null,
      message: 'Get recipe not yet implemented.',
    } as ApiResponse<Recipe>,
  };
}

app.http('getRecipe', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: getRecipe,
});

export default getRecipe;
