import { z } from 'zod';

// User Profile Validation
export const dietaryPreferenceSchema = z.object({
  type: z.enum([
    'vegetarian',
    'vegan',
    'keto',
    'paleo',
    'gluten-free',
    'dairy-free',
    'low-carb',
    'mediterranean',
  ]),
  strict: z.boolean().default(false),
});

export const macronutrientGoalsSchema = z.object({
  caloriesPerDay: z.number().min(800).max(5000).optional(),
  proteinGrams: z.number().min(0).max(500).optional(),
  carbsGrams: z.number().min(0).max(800).optional(),
  fatGrams: z.number().min(0).max(300).optional(),
  fiberGrams: z.number().min(0).max(100).optional(),
});

export const userProfileSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  dietaryPreferences: z.array(dietaryPreferenceSchema).default([]),
  allergies: z.array(z.string().min(1).max(100)).default([]),
  macronutrientGoals: macronutrientGoalsSchema.default({}),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const updateUserProfileSchema = userProfileSchema
  .pick({
    firstName: true,
    lastName: true,
    dietaryPreferences: true,
    allergies: true,
    macronutrientGoals: true,
  })
  .partial();

// Authentication Validation
export const loginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name too long'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long'),
});

// API Validation
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Export types derived from schemas
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type LoginRequestInput = z.infer<typeof loginRequestSchema>;
export type RegisterRequestInput = z.infer<typeof registerRequestSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
