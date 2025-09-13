// Enhanced main.bicep for Meal Planner Application
targetScope = 'subscription'

@description('Storage account name override (optional)')
param storageAccountName string?

@description('Azure region for all resources')
param location string = 'Sweden Central'

@description('Resource tags')
param tags object?

@description('Environment designation')
@allowed([
  'dev'
  'prod'
])
param environment string = 'dev'

@description('Base name for all resources')
param baseName string = '${substring(environment, 0, 1)}-mealplanner'

@description('PostgreSQL admin username')
@secure()
param postgresAdminLogin string

@description('PostgreSQL admin password')
@secure()
param postgresAdminPassword string

// Resource naming convention
var resourceNames = {
  resourceGroup: baseName
  storageAccount: storageAccountName ?? replace('${baseName}str${uniqueString(subscription().id, baseName)}', '-', '')
  managedIdentity: '${baseName}-mi'
  functionApp: '${baseName}-functions'
  appServicePlan: '${baseName}-plan'
  postgresql: '${baseName}-pg'
}

// Main resource group
resource resourceGroup 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceNames.resourceGroup
  location: location
  tags: tags
}


module userAssignedIdentity 'br/public:avm/res/managed-identity/user-assigned-identity:0.4.1' = {
  name: '${deployment().name}-miua'
  scope: resourceGroup
  params: {
    name: resourceNames.managedIdentity
    tags: tags ?? {}
    location: location
  }
}

// Storage Account for Azure Functions and recipe images
module storageAccount 'br/public:avm/res/storage/storage-account:0.26.2' = {
  name: '${deployment().name}-storage'
  scope: resourceGroup
  params: {
    name: resourceNames.storageAccount
    location: location
    skuName: 'Standard_LRS'
    kind: 'StorageV2'
    accessTier: 'Hot'
    allowBlobPublicAccess: true
      publicNetworkAccess: 'Enabled'
      networkAcls: {
        bypass: 'AzureServices'
        defaultAction: 'Allow'
        ipRules: []
        virtualNetworkRules: []
      }
    enableTelemetry: false
    blobServices: {
      containers: [
        {
          name: 'recipe-images'
          publicAccess: 'Blob'
        }
        {
          name: 'user-uploads'
          publicAccess: 'None'
        }
      ]
    }
    tags: tags ?? {}
  }
}

// PostgreSQL Flexible Server (AVM module)
module postgresql 'br/public:avm/res/db-for-postgre-sql/flexible-server:0.13.1' = {
  name: '${deployment().name}-pg'
  scope: resourceGroup
  params: {
    name: resourceNames.postgresql
    location: location
    administratorLogin: postgresAdminLogin
    administratorLoginPassword: postgresAdminPassword
    skuName: environment == 'dev' ? 'Standard_B1ms' : 'Standard_D2s_v3'
    tier: environment == 'dev' ? 'Burstable' : 'GeneralPurpose'
    storageSizeGB: environment == 'dev' ? 32 : 128
    version: '15'
    availabilityZone: -1
    enableTelemetry: false
    tags: tags ?? {}
  }
}

// App Service Plan for Azure Functions
module appServicePlan 'br/public:avm/res/web/serverfarm:0.5.0' = {
  name: '${deployment().name}-asp'
  scope: resourceGroup
  params: {
    name: resourceNames.appServicePlan
    location: location
    skuName: environment == 'dev' ? 'Y1' : 'P1v3'
    skuCapacity: 1
    kind: 'functionapp'
    tags: tags ?? {}
  }
}


// Outputs for use in other deployments or CI/CD
output resourceGroupName string = resourceGroup.name
output storageAccountName string = storageAccount.outputs.name
output managedIdentityClientId string = userAssignedIdentity.outputs.clientId
output managedIdentityPrincipalId string = userAssignedIdentity.outputs.principalId
output postgresqlServerName string = postgresql.outputs.name
output postgresqlFqdn string = postgresql.outputs.fqdn
output appServicePlanId string = appServicePlan.outputs.resourceId
