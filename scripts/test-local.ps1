# Meal Planner - Local Testing Script (PowerShell)

Write-Host "🚀 Starting Meal Planner Local Test Environment" -ForegroundColor Green
Write-Host ""

# Step 1: Start PostgreSQL
Write-Host "📦 Step 1: Starting PostgreSQL with Docker Compose..." -ForegroundColor Cyan
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 2: Run migrations
Write-Host "🗄️  Step 2: Running database migrations..." -ForegroundColor Cyan
$env:PGPASSWORD = "dev_password_123"
psql -h localhost -U mealplanner -d mealplanner_dev -f packages/backend/db/migrations/002_epic2_meal_planning.sql

# Step 3: Build backend
Write-Host "🔨 Step 3: Building backend..." -ForegroundColor Cyan
Set-Location packages/backend
npm run build

# Step 4: Start Azure Functions
Write-Host "⚡ Step 4: Starting Azure Functions..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Functions will be available at:" -ForegroundColor Green
Write-Host "  - Health Check:     http://localhost:7071/api/healthCheck" -ForegroundColor White
Write-Host "  - Get Recipe:       http://localhost:7071/api/getRecipe?id={uuid}" -ForegroundColor White
Write-Host "  - Search Recipes:   http://localhost:7071/api/searchRecipes" -ForegroundColor White
Write-Host "  - Generate Plan:    http://localhost:7071/api/generateMealPlan" -ForegroundColor White
Write-Host ""
npm run start
