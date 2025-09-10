param identityName string = 'd-mealplanner-mi'
param location string

resource userAssignedIdentities_d_mealplanner_mi_name_resource 'Microsoft.ManagedIdentity/userAssignedIdentities@2025-01-31-preview' = {
  name: identityName
  location: 'swedencentral'

  resource userAssignedIdentities_d_mealplanner_mi_name_gi_oidc_mealplanner_dev 'federatedIdentityCredentials@2025-01-31-preview' = {
    name: 'gi-oidc-mealplanner-dev'
    properties: {
      issuer: 'https://token.actions.githubusercontent.com'
      subject: 'repo:jagiraud/mealplanner:environment:dev'
      audiences: [
        'api://AzureADTokenExchange'
      ]
    }
  }
}
