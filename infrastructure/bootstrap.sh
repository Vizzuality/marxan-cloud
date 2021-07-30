#!/usr/bin/env bash
set -e

az group create --name=marxanmanual-hotzevzl --location=westeurope
az storage account create --name=marxanhotzevzl --resource-group=marxanmanual-hotzevzl
az storage container create --name=tfstate --account-name=marxanhotzevzl --resource-group=marxanmanual-hotzevzl