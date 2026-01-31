-- Test Data for Epic 2: Meal Planning

-- Insert test user
INSERT INTO user_profile (id, email, password_hash, first_name, last_name, dietary_preferences, allergies)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'hash123', 'Test', 'User', '[]'::jsonb, ARRAY[]::TEXT[])
ON CONFLICT (id) DO NOTHING;

-- Insert test ingredients
INSERT INTO ingredient (id, name, category, unit, calories, protein, carbs, fat, fiber)
VALUES 
  ('10000000-0000-0000-0000-000000000001', 'Chicken Breast', 'meat', 'grams', 165, 31, 0, 3.6, 0),
  ('10000000-0000-0000-0000-000000000002', 'Brown Rice', 'grain', 'grams', 112, 2.6, 24, 0.9, 1.8),
  ('10000000-0000-0000-0000-000000000003', 'Broccoli', 'vegetable', 'grams', 34, 2.8, 7, 0.4, 2.6),
  ('10000000-0000-0000-0000-000000000004', 'Salmon', 'fish', 'grams', 206, 22, 0, 13, 0),
  ('10000000-0000-0000-0000-000000000005', 'Quinoa', 'grain', 'grams', 120, 4.4, 21, 1.9, 2.8),
  ('10000000-0000-0000-0000-000000000006', 'Spinach', 'vegetable', 'grams', 23, 2.9, 3.6, 0.4, 2.2)
ON CONFLICT (id) DO NOTHING;

-- Insert test recipes
INSERT INTO recipe (id, name, description, cooking_time_minutes, macronutrients, tags, created_by)
VALUES 
  (
    '20000000-0000-0000-0000-000000000001',
    'Grilled Chicken with Rice',
    'A simple, healthy meal with grilled chicken breast and brown rice',
    30,
    '{"caloriesPerDay": 500, "proteinGrams": 35, "carbsGrams": 45, "fatGrams": 10}'::jsonb,
    ARRAY['high-protein', 'gluten-free'],
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Baked Salmon with Quinoa',
    'Omega-3 rich salmon with protein-packed quinoa and vegetables',
    35,
    '{"caloriesPerDay": 600, "proteinGrams": 40, "carbsGrams": 35, "fatGrams": 25}'::jsonb,
    ARRAY['keto', 'high-protein', 'gluten-free'],
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'Chicken Broccoli Bowl',
    'Quick and easy chicken with steamed broccoli and brown rice',
    20,
    '{"caloriesPerDay": 450, "proteinGrams": 38, "carbsGrams": 40, "fatGrams": 8}'::jsonb,
    ARRAY['high-protein', 'low-carb', 'gluten-free'],
    '00000000-0000-0000-0000-000000000001'
  )
ON CONFLICT (id) DO NOTHING;

-- Link ingredients to recipes
INSERT INTO recipe_ingredient (recipe_id, ingredient_id, name, quantity, unit)
VALUES 
  -- Grilled Chicken with Rice
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Chicken Breast', 200, 'grams'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Brown Rice', 150, 'grams'),
  -- Baked Salmon with Quinoa
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'Salmon', 200, 'grams'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'Quinoa', 150, 'grams'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'Spinach', 100, 'grams'),
  -- Chicken Broccoli Bowl
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Chicken Breast', 200, 'grams'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Broccoli', 150, 'grams'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Brown Rice', 100, 'grams')
ON CONFLICT (recipe_id, ingredient_id) DO NOTHING;

-- Insert some ratings
INSERT INTO recipe_rating (recipe_id, user_id, rating, favorite, comment)
VALUES 
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 5, true, 'My favorite recipe!'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 4, false, 'Very tasty and healthy')
ON CONFLICT (recipe_id, user_id) DO NOTHING;
