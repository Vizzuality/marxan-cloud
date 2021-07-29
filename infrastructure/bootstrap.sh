#!/usr/bin/env bash
set -e

az group create --name=landgriffonmanual-tom --location=westeurope
az storage account create --name=landgriffontom --resource-group=landgriffonmanual-tom
az storage container create --name=tfstate --account-name=landgriffontom --resource-group=landgriffonmanual-tom