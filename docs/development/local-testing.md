# Local Testing Guide

## Prerequisites

1. **Docker Desktop** - for PostgreSQL
2. **Node.js 18+** - for Azure Functions
3. **Azure Functions Core Tools** - install with `npm install -g azure-functions-core-tools@4`
4. **PostgreSQL Client** (optional) - for running migrations manually

## Quick Start

### Option 1: Automated Script (Recommended)

**macOS/Linux:**
```bash
chmod +x scripts/test-local.sh
./scripts/test-local.sh
```

**Windows PowerShell:**
```powershell
.\scripts\test-local.ps1
```

### Option 2: Manual Steps

1. **Start PostgreSQL:**
   ```bash
   docker-compose up -d postgres
   ```

2. **Run Database Migrations:**
   ```bash
   PGPASSWORD=dev_password_123 psql -h localhost -U mealplanner -d mealplanner_dev -f packages/backend/db/migrations/002_epic2_meal_planning.sql
   ```

3. **Build and Start Backend:**
   ```bash
   cd packages/backend
   npm install
   npm run build
   npm start
   ```

## Testing the Endpoints

### Health Check
```bash
curl http://localhost:7071/api/healthCheck
```

### Search Recipes (GET with query params)
```bash
curl "http://localhost:7071/api/searchRecipes?name=pasta&maxCookingTime=30"
```

### Search Recipes (POST with filters)
```bash
curl -X POST http://localhost:7071/api/searchRecipes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "chicken",
    "maxCookingTime": 45,
    "dietaryPreferences": ["keto"],
    "page": 1,
    "limit": 10
  }'
```

### Get Recipe by ID
```bash
curl "http://localhost:7071/api/getRecipe?id=YOUR-RECIPE-UUID"
```

### Generate Meal Plan
```bash
curl -X POST http://localhost:7071/api/generateMealPlan \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR-USER-UUID",
    "daysCount": 7,
    "mealsPerDay": 3,
    "targetCalories": 2000,
    "dietaryPreferences": ["vegetarian"],
    "allergies": ["peanuts"]
  }'
```

## Adding Test Data

You'll need to add some test recipes to the database before the endpoints will return data:

```sql
-- Connect to database
psql -h localhost -U mealplanner -d mealplanner_dev

-- Insert a test user (if not exists)
INSERT INTO user_profile (id, email, first_name, last_name)
VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test', 'User')
ON CONFLICT DO NOTHING;

-- Insert test ingredients
INSERT INTO ingredient (id, name, category, unit, calories, protein, carbs, fat)
VALUES 
  ('10000000-0000-0000-0000-000000000001', 'Chicken Breast', 'meat', 'grams', 165, 31, 0, 3.6),
  ('10000000-0000-0000-0000-000000000002', 'Brown Rice', 'grain', 'grams', 112, 2.6, 24, 0.9)
ON CONFLICT DO NOTHING;

-- Insert a test recipe
INSERT INTO recipe (id, name, description, cooking_time_minutes, macronutrients, tags, created_by)
VALUES (
  '20000000-0000-0000-0000-000000000001',
  'Grilled Chicken with Rice',
  'A simple, healthy meal',
  30,
  '{"caloriesPerDay": 500, "proteinGrams": 35, "carbsGrams": 45, "fatGrams": 10}',
  ARRAY['keto', 'high-protein'],
  '00000000-0000-0000-0000-000000000001'
);

-- Link ingredients to recipe
INSERT INTO recipe_ingredient (recipe_id, ingredient_id, name, quantity, unit)
VALUES 
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Chicken Breast', 200, 'grams'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Brown Rice', 150, 'grams');
```

## Troubleshooting

### PostgreSQL Connection Issues
- Make sure Docker Desktop is running
- Check that port 5432 is not in use: `lsof -i :5432` (macOS/Linux) or `netstat -ano | findstr :5432` (Windows)
- Restart the container: `docker-compose restart postgres`

### Azure Functions Not Starting
- Make sure port 7071 is available
- Check Node.js version: `node --version` (should be 18+)
- Rebuild: `npm run clean && npm run build`

### Migration Errors
- Check if migrations already ran: Connect to DB and check if tables exist
- If you need to reset: `docker-compose down -v && docker-compose up -d postgres`

## Stopping the Environment

```bash
# Stop Azure Functions: Ctrl+C in the terminal

# Stop PostgreSQL
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```
