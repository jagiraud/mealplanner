using './main.bicep'

param environment = 'dev'
param location = resourceGroup().location
param postgresAdminLogin = ''
param postgresAdminPassword = ''

