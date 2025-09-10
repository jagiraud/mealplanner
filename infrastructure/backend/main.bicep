targetScope = 'subscription'

param storageAccountName string?
param location string = 'Sweden Central'
param tags object?

@allowed([
  'dev'
  'prod'
])
param environment string = 'dev'
param baseName string = '${environment}-mealplanner'

var resourceNames = {
  resourceGroup: baseName
  storageAccount: storageAccountName ?? replace('${baseName}4564213', '-', '')
  managedIdentity: '${baseName}-mi'
}


resource resourceGroup 'Microsoft.Resources/resourceGroups@2025-04-01' = {
  name: resourceNames.resourceGroup
  location: location
}

module managedIdentity '.bicep/managed-identity.bicep' = {
  name: '${deployment().name}-mi'
  scope: resourceGroup
  params: {
    identityName: resourceNames.managedIdentity
    location: location
  }
}

module testStorage 'br/public:avm/res/storage/storage-account:0.26.2' = {
  name: '${deployment().name}-storage'
  scope: resourceGroup
  params: {
    name: resourceNames.storageAccount
    location: resourceGroup.location
    skuName: 'Standard_LRS'
    kind: 'StorageV2'
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    enableTelemetry: false
    tags: tags ?? {}
  }
}
