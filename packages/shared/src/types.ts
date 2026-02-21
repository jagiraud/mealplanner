// User Profile Types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dietaryPreferences: DietaryPreference[];
  allergies: string[];
  macronutrientGoals: MacronutrientGoals;
  createdAt: Date;
  updatedAt: Date;
}

export interface DietaryPreference {
  type:
    | 'vegetarian'
    | 'vegan'
    | 'keto'
    | 'paleo'
    | 'gluten-free'
    | 'dairy-free'
    | 'low-carb'
    | 'mediterranean';
  strict: boolean;
}

export interface MacronutrientGoals {
  caloriesPerDay?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  fiberGrams?: number;
}

// Authentication Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ValidationError extends ApiError {
  field: string;
  value: any;
}

// --- Epic 2: Meal Planning & Recipes ---

export interface Ingredient {
  id: string;
  name: string;
  category: string; // e.g. vegetable, dairy, meat, etc.
  unit: string; // e.g. grams, ml, pieces
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  cookingTimeMinutes: number;
  macronutrients: MacronutrientGoals;
  tags?: string[];
  imageUrl?: string;
  sourceUrl?: string;
  servings?: number;
  recipeCategory?: string[];
  ratings?: RecipeRating[];
  createdBy?: string; // user id (null for crawled recipes)
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeIngredient {
  ingredientId?: string;
  name?: string;
  rawText?: string;
  quantity?: number;
  unit?: string;
}

export interface RecipeRating {
  userId: string;
  rating: number; // 1-5
  favorite: boolean;
  comment?: string;
  createdAt: Date;
}

export interface MealPlan {
  id: string;
  userId: string;
  weekStart: Date;
  days: MealPlanDay[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MealPlanDay {
  date: Date;
  recipes: MealPlanRecipe[];
}

export interface MealPlanRecipe {
  recipeId: string;
  servings: number;
}
