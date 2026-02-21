-- Epic 3: Recipe Crawling & Full MVP Schema Updates

-- Enable trigram extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add missing columns to recipe table
ALTER TABLE recipe ADD COLUMN IF NOT EXISTS instructions TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE recipe ADD COLUMN IF NOT EXISTS source_url TEXT UNIQUE;
ALTER TABLE recipe ADD COLUMN IF NOT EXISTS servings INT;
ALTER TABLE recipe ADD COLUMN IF NOT EXISTS recipe_category TEXT[];

-- Make created_by nullable (crawled recipes have no user)
ALTER TABLE recipe ALTER COLUMN created_by DROP NOT NULL;

-- Make cooking_time_minutes nullable (some recipes may not specify)
ALTER TABLE recipe ALTER COLUMN cooking_time_minutes DROP NOT NULL;

-- Rework recipe_ingredient to support crawled data:
-- 1. Drop the old composite PK (requires ingredient_id which crawled recipes won't have)
-- 2. Add surrogate PK and raw_text column
-- 3. Make structured fields nullable

ALTER TABLE recipe_ingredient DROP CONSTRAINT recipe_ingredient_pkey;
ALTER TABLE recipe_ingredient ADD COLUMN id UUID DEFAULT gen_random_uuid();
ALTER TABLE recipe_ingredient ADD COLUMN raw_text TEXT;
ALTER TABLE recipe_ingredient ALTER COLUMN ingredient_id DROP NOT NULL;
ALTER TABLE recipe_ingredient ALTER COLUMN name DROP NOT NULL;
ALTER TABLE recipe_ingredient ALTER COLUMN quantity DROP NOT NULL;
ALTER TABLE recipe_ingredient ALTER COLUMN unit DROP NOT NULL;
ALTER TABLE recipe_ingredient ADD PRIMARY KEY (id);

-- Drop the FK constraint on ingredient_id so crawled ingredients don't need an ingredient row
ALTER TABLE recipe_ingredient DROP CONSTRAINT recipe_ingredient_ingredient_id_fkey;
ALTER TABLE recipe_ingredient ADD CONSTRAINT recipe_ingredient_ingredient_id_fkey
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(id) ON DELETE SET NULL;

-- Add unique constraint on ingredient name for upsert support
CREATE UNIQUE INDEX IF NOT EXISTS idx_ingredient_name_unique ON ingredient (name);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipe_tags ON recipe USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_recipe_category ON recipe USING GIN (recipe_category);
CREATE INDEX IF NOT EXISTS idx_recipe_name_trgm ON recipe USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_recipe_source_url ON recipe (source_url);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredient_recipe_id ON recipe_ingredient (recipe_id);
