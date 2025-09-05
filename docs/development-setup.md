# Development Environment Setup

This project supports multiple development environment options for dependency isolation and consistent development experience.

## 🚀 Quick Start Options

### Option 1: Node Version Manager (Recommended for Local Development)

```bash
# Install nvm if you haven't already
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Use the project's Node.js version
nvm use

# If the version isn't installed, install it
nvm install

# Install dependencies
npm install

# Start development
npm run dev
```

### Option 2: VS Code Dev Container (Recommended for Teams)

1. Install Docker Desktop
2. Install VS Code with the "Dev Containers" extension
3. Open project in VS Code
4. Click "Reopen in Container" when prompted
5. Dependencies will be automatically installed

### Option 3: Docker Compose (Manual Container Setup)

```bash
# Build and start the development environment
docker-compose up --build

# Access the running container
docker-compose exec app sh

# Run commands inside the container
docker-compose exec app npm test
```

### Option 4: Traditional Local Setup (Not Recommended)

```bash
# Ensure you have Node.js 18+ installed
node --version

# Install dependencies
npm install

# Start development
npm run dev
```

## 🔧 Environment Configuration

### Required Environment Variables

Create `.env.local` files in each package:

**packages/frontend/.env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:7071/api
NEXT_PUBLIC_APP_ENV=development
```

**packages/backend/.env.local:**
```env
DATABASE_URL=postgresql://mealplanner:dev_password_123@localhost:5432/mealplanner_dev
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-here
AZURE_STORAGE_CONNECTION_STRING=your-azure-storage-connection-string
```

### Database Setup

#### With Docker (Recommended):
```bash
# Start PostgreSQL container
docker-compose up postgres -d

# Run database migrations
npm run migrate --workspace=packages/backend
```

#### Local PostgreSQL:
```bash
# Install PostgreSQL 15+
# Create database
createdb mealplanner_dev

# Set DATABASE_URL in .env.local
# Run migrations
npm run migrate --workspace=packages/backend
```

## 📦 Package Management

This project uses npm workspaces for monorepo management:

```bash
# Install dependencies for all packages
npm install

# Install dependency for specific package
npm install package-name --workspace=packages/frontend

# Run script in specific package
npm run build --workspace=packages/shared

# Run script in all packages
npm run test --workspaces
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific package tests
npm test --workspace=packages/backend

# Run integration tests (requires running services)
npm run test:integration
```

## 🚀 Development Commands

```bash
# Start frontend development server
npm run dev

# Start backend Azure Functions locally
npm run dev --workspace=packages/backend

# Build all packages
npm run build

# Lint all code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check
```

## 🐛 Debugging

### VS Code Debugging (Dev Container)
Debugging is preconfigured in the dev container. Just set breakpoints and press F5.

### Manual Debugging
```bash
# Debug backend functions
npm run debug --workspace=packages/backend

# Debug frontend
npm run debug --workspace=packages/frontend
```

## 🔍 Troubleshooting

### Common Issues

1. **Node version mismatch:**
   ```bash
   nvm use
   npm install
   ```

2. **Port conflicts:**
   ```bash
   # Kill processes on ports
   lsof -ti:3000 | xargs kill -9
   lsof -ti:7071 | xargs kill -9
   ```

3. **Database connection issues:**
   ```bash
   # Reset database container
   docker-compose down postgres
   docker-compose up postgres -d
   ```

4. **Package build issues:**
   ```bash
   # Clean and rebuild
   npm run clean
   npm install
   npm run build --workspace=packages/shared
   ```

### Getting Help

- Check the troubleshooting section above
- Review [Azure Functions local development](https://docs.microsoft.com/en-us/azure/azure-functions/functions-develop-local)
- Open an issue in the repository

## 🎯 Recommended Development Flow

1. **Use VS Code Dev Container** for consistent environment
2. **Create feature branches** from main: `git checkout -b feature/your-feature`
3. **Make small, focused commits** using conventional commit format
4. **Run tests before committing**: `npm test`
5. **Push and create pull requests** for code review

## 📊 Performance Monitoring

The development environment includes:
- Hot reload for frontend changes
- Live reload for backend function changes
- Database query logging in development
- Performance metrics collection
- Error tracking and logging
