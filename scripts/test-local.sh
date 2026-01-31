#!/bin/bash

# Meal Planner - Local Testing Script

echo "🚀 Starting Meal Planner Local Test Environment"
echo ""

# Step 1: Start PostgreSQL
echo "📦 Step 1: Starting PostgreSQL with Docker Compose..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Step 2: Run migrations
echo "🗄️  Step 2: Running database migrations..."
PGPASSWORD=dev_password_123 psql -h localhost -U mealplanner -d mealplanner_dev -f packages/backend/db/migrations/002_epic2_meal_planning.sql

# Step 3: Build backend
echo "🔨 Step 3: Building backend..."
cd packages/backend
npm run build

# Step 4: Start Azure Functions
echo "⚡ Step 4: Starting Azure Functions..."
echo ""
echo "Functions will be available at:"
echo "  - Health Check:     http://localhost:7071/api/healthCheck"
echo "  - Get Recipe:       http://localhost:7071/api/getRecipe?id={uuid}"
echo "  - Search Recipes:   http://localhost:7071/api/searchRecipes"
echo "  - Generate Plan:    http://localhost:7071/api/generateMealPlan"
echo ""
npm run start
