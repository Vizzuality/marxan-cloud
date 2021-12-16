# Deploying and managing a Marxan Cloud instance on Azure Cloud

## Requirements

The Marxan Cloud platform can run natively on Azure Kubernetes Service (AKS),
whereas the frontend service can be hosted on a [Vercel](https://vercel.com)
account.

### Azure

The full list of Azure resources needed to run an instance is outlined here:

- one AKS Kubernetes cluster

  - one node pool
  - 3x D4 v2 nodes
  - 2x E20 OS disks

- two instances of Azure Database for PostgresSQL

  - one D4 v3 instance (database for API metadata)
  - one D8 v3 instance (geoprocessing database)

- one VM as bastion host

  - one D2a v4 Virtual Machine

- one storage account

  - this is used for block blob storage buckets (for downloads of large files
    from the Marxan Cloud platform and for Terraform state management)

The specific SKUs for Azure resources will depend on the load profile of each
instance; for example, geoprocessing databases may use Memory-Optimized
instances (Ev4 series).

### Vercel

Additionally, a [Vercel](https://vercel.com) account is needed to manage and
deploy the frontend app.

### GitHub

To automate deployments, a copy of the Marxan Cloud source code repository
should be hosted on GitHub. The CI/CD pipelines included in the Marxan Cloud
platform take care of running tests and to deploy new releases to an AKS
Kubernetes cluster and to Vercel.
