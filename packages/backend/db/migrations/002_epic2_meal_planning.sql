-- Epic 2: Meal Planning & Recipes Schema

-- Ingredient table
CREATE TABLE ingredient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    calories NUMERIC,
    protein NUMERIC,
    carbs NUMERIC,
    fat NUMERIC,
    fiber NUMERIC
);

-- Recipe table
CREATE TABLE recipe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    cooking_time_minutes INT NOT NULL,
    macronutrients JSONB,
    tags TEXT[],
    image_url TEXT,
    created_by UUID REFERENCES user_profile(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RecipeIngredient (many-to-many)
CREATE TABLE recipe_ingredient (
    recipe_id UUID REFERENCES recipe(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredient(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    PRIMARY KEY (recipe_id, ingredient_id)
);

-- RecipeRating
CREATE TABLE recipe_rating (
    recipe_id UUID REFERENCES recipe(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profile(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    favorite BOOLEAN DEFAULT FALSE,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (recipe_id, user_id)
);

-- MealPlan
CREATE TABLE meal_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profile(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- MealPlanDay
CREATE TABLE meal_plan_day (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID REFERENCES meal_plan(id) ON DELETE CASCADE,
    date DATE NOT NULL
);

-- MealPlanRecipe (recipes per day)
CREATE TABLE meal_plan_recipe (
    meal_plan_day_id UUID REFERENCES meal_plan_day(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipe(id) ON DELETE CASCADE,
    servings INT NOT NULL,
    PRIMARY KEY (meal_plan_day_id, recipe_id)
);
