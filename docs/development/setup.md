# Development Setup Guide

This guide will help you set up the Meal Planner application for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later) - [Download](https://nodejs.org/)
- **npm** (v9 or later) - Comes with Node.js
- **Azure CLI** - [Installation Guide](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- **Azure Functions Core Tools** - [Installation Guide](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- **PostgreSQL** (v14 or later) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/jagiraud/mealplanner.git
   cd mealplanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp packages/backend/local.settings.json.example packages/backend/local.settings.json
   
   # Edit the file with your local configuration
   # Update PostgreSQL connection string and other settings
   ```

4. **Set up local database**
   ```bash
   # Create a local PostgreSQL database
   createdb mealplanner_dev
   
   # Run database migrations (when available)
   npm run db:migrate --workspace=packages/backend
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Start the backend (Azure Functions)
   npm run dev --workspace=packages/backend
   
   # Terminal 2: Start the frontend (React with Vite)
   npm run dev --workspace=packages/frontend
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:7071

## Project Structure

```
mealplanner/
├── .github/                    # GitHub Actions workflows
├── docs/                       # Documentation
│   ├── development/           # Development guides
│   └── prd/                   # Product requirements
├── infrastructure/             # Azure Bicep templates
├── packages/                   # Monorepo packages
│   ├── backend/               # Azure Functions API
│   ├── frontend/              # React application
│   └── shared/                # Shared types and utilities
├── .eslintrc.js               # ESLint configuration
├── .prettierrc.js             # Prettier configuration
├── .gitignore                 # Git ignore rules
├── package.json               # Root package.json
└── README.md                  # Project overview
```

## Development Workflow

### Code Quality

We use ESLint and Prettier to maintain code quality:

```bash
# Lint all code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format
```

### Testing

Run tests across all packages:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Building

Build all packages:

```bash
# Build all packages
npm run build

# Build specific package
npm run build --workspace=packages/frontend
npm run build --workspace=packages/backend
```

## Environment Configuration

### Backend Environment Variables

Edit `packages/backend/local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "POSTGRES_CONNECTION_STRING": "postgresql://username:password@localhost:5432/mealplanner_dev",
    "JWT_SECRET": "your-local-jwt-secret-key",
    "JWT_EXPIRES_IN": "15m",
    "REFRESH_TOKEN_EXPIRES_IN": "7d"
  }
}
```

### Frontend Environment Variables

Create `packages/frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:7071
VITE_APP_NAME=Meal Planner
VITE_APP_VERSION=1.0.0
```

## Database Setup

### Local PostgreSQL Setup

1. **Install PostgreSQL** (if not already installed)
2. **Create development database**:
   ```bash
   createdb mealplanner_dev
   ```
3. **Update connection string** in `packages/backend/local.settings.json`

### Database Migrations

Database migrations will be handled through a dedicated migration system (to be implemented in future stories).

## Debugging

### Backend Debugging

The Azure Functions can be debugged using VS Code:

1. Open the `packages/backend` folder in VS Code
2. Install the Azure Functions extension
3. Set breakpoints in your TypeScript code
4. Press F5 to start debugging

### Frontend Debugging

React application debugging:

1. Use browser developer tools
2. React DevTools extension is recommended
3. VS Code debugging configuration available

## Deployment

### Local Azure Emulation

Use Azure Storage Emulator for local development:

```bash
# Install Azurite (Azure Storage Emulator)
npm install -g azurite

# Start Azurite
azurite --silent --location c:\azurite --debug c:\azurite\debug.log
```

### Deploy to Azure

```bash
# Deploy infrastructure
npm run deploy:infra

# Deploy backend
npm run deploy:backend

# Deploy frontend
npm run deploy:frontend

# Deploy everything
npm run deploy
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000 (frontend) and 7071 (backend) are available
2. **PostgreSQL connection**: Verify PostgreSQL is running and connection string is correct
3. **Node version**: Ensure you're using Node.js v18 or later
4. **Azure Functions**: Make sure Azure Functions Core Tools are installed

### Getting Help

- Check the [troubleshooting guide](./troubleshooting.md)
- Review the [FAQ](./faq.md)
- Open an issue on GitHub

## Next Steps

After setting up your development environment:

1. Review the [Contributing Guidelines](../../CONTRIBUTING.md)
2. Check out the [Architecture Documentation](../architecture/index.md)
3. Start with a simple feature implementation
4. Run tests and ensure everything works

## Development Standards

- **Code Style**: Follow ESLint and Prettier configurations
- **Testing**: Maintain test coverage above 80%
- **Documentation**: Document all public APIs and complex logic
- **Security**: Never commit secrets or sensitive data
- **Performance**: Consider performance implications of all changes
