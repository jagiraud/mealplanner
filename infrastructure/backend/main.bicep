targetScope = 'subscription'

param storageAccountName string
param location string = 'Sweden Central'
param tags object?


resource resourceGroup 'Microsoft.Resources/resourceGroups@2025-04-01' = {
  name: 'd-mealplanner'
  location: location
}

module testStorage 'br/public:avm/res/storage/storage-account:0.26.2' = {
  name: '${deployment().name}-storage'
  scope: resourceGroup
  params: {
    name: storageAccountName
    location: resourceGroup.location
    skuName: 'Standard_LRS'
    kind: 'StorageV2'
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    enableTelemetry: false
    tags: tags ?? {}
  }
}
