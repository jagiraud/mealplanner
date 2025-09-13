using 'main.bicep'

param storageAccountName = 'dmpstorage23231'
param location = 'Sweden Central'
param environment = 'dev'
param postgresAdminLogin = 'mealplanner_admin'
param postgresAdminPassword = 'SecurePassword123!'
param tags = {
  project: 'mealplanner'
  owner: 'jacobg'
  environment: 'dev'
}

