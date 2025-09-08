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
