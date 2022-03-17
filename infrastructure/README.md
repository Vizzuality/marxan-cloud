# Infrastructure

While the application can be deployed in any server configuration that supports the application's
dependencies, this project includes a [Terraform](https://www.terraform.io/) project
that you can use to easily and quickly deploy it using
[Microsoft Azure](https://azure.microsoft.com/en-us/) and its [Kubernetes](https://kubernetes.io/)
managed service, [AKS](https://azure.microsoft.com/en-us/services/kubernetes-service/).

## Dependencies

Here is the list of technical dependencies for deploying the Marxan app using these infrastructure
resources. Note that these requirements are for this particular deployment strategy, and not dependencies
of the Marxan application itself - which can be deployed to other infrastructures.

Before proceeding, be sure you are familiar with all of these tools, as these instructions
will skip over the basics, and assume you are conformable using all of them. 

- [Microsoft Azure](https://azure.microsoft.com)
- [Terraform](https://www.terraform.io/)
- [Docker](https://www.docker.com/)
- [Kubernetes](https://kubernetes.io/)
- [Helm](https://helm.sh/)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Github Actions](https://github.com/features/actions)
- [Bastion host](https://en.wikipedia.org/wiki/Bastion_host) pattern
- An SSH client capable of establishing [SSH Tunnels](https://www.ssh.com/academy/ssh/tunneling/example)
- DNS management 
- A purchased domain

Of the above, the following need to be set up prior to following the instructions in this document:

- An Azure account with a user with enough permissions to create a
[Resource Group](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/overview), 
[Apps and Service Principals](https://docs.microsoft.com/en-us/azure/active-directory/develop/app-objects-and-service-principals),
as well as multiple other resources in Azure.
- Azure CLI, Kubectl and an SSH client capable of establishing SSH Tunnels need to be installed locally.
- Access to managing Github Actions Secrets

#### A note on Azure quotas

Azure quotas for things like VMs are, by default, low, meaning you may see your cluster resources not be provisioned
(either during deploy time, or later on as part of an autoscaling policy). It's advisable to review and adjust said
quotas.

## Structure

This project has 3 main sections, each of which with a folder named after it. Each of these sections has a
Terraform project, that logically depends on their predecessors. There is a 4th component to this architecture, 
which is handled by Github Actions

#### Remote state

Contains basic Azure resources, like a [Resource Group](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/overview)
or a [Storage Account](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-overview)
to store the Terraform remote state.

#### Base

Contains multiple Azure resources needed for running Marxan on an 
[AKS cluster](https://azure.microsoft.com/en-us/services/kubernetes-service/).

These resources include, but are not limited to:
- An [Azure Cache for Redis](https://azure.microsoft.com/en-us/services/cache/)
- Kubernetes node pools
- Multiple VNets, Subnets and networking security rules
- A Bastion host
- An [Azure DNS](https://azure.microsoft.com/en-us/services/dns/)
- An [Azure Container Registry](https://azure.microsoft.com/en-us/services/container-registry/) to store Docker images.

The output values include access data for some of the resources above.

#### Kubernetes

Contains the Kubernetes configuration to run Marxan on the resources created in the previous section, as well as some
new resources:

- Kubernetes deployments for the Marxan app components
- Kubernetes secrets, namespaces and ingresses
- HTTPS certificate manager
- PostgreSQL database (as a Helm chart)

*Notice:* when first applying this project, you may get an `Error: Invalid index` message from the ingress/load balancer
component. That is expected, and applying the same plan a 2nd time should succeed.

#### Github Actions

As part of this infrastructure, Github Actions are used to automatically build and push Docker images to Azure ACR, and
to redeploy Kubernetes pods once that happens. To be able to do so, you need to specify the following Github Actions
Secrets with the corresponding values:

- `AZURE_AKS_CLUSTER_NAME`: The name of the AKS cluster. Get from `Base`'s `k8s_cluster_name`
- `AZURE_AKS_HOST`: The AKS cluster hostname (without port or protocol). Get from `Base`'s `k8s_cluster_hostname`
- `AZURE_CLIENT_ID`: The hostname for the Azure ACT. Get from `Base`'s `container_registry_client_id`
- `AZURE_RESOURCE_GROUP`: The AKS Resource Group name. Specified by you when setting up the infrastructure.
- `AZURE_SUBSCRIPTION_ID`: The Azure Subscription Id. Get from `Base`'s `azure_subscription_id`
- `AZURE_TENANT_ID`: The Azure Tenant Id. Get from `Base`'s `azure_tenant_id`
- `BASTION_HOST`: The hostname for the bastion machine. Get from `Base`'s `bastion_hostname`
- `REGISTRY_LOGIN_SERVER`: The hostname for the Azure ACR. Get from `Base`'s `container_registry_hostname`
- `REGISTRY_USERNAME`: The username for the Azure ACR. Get from `Base`'s `container_registry_client_id`
- `REGISTRY_PASSWORD`: The password to access the Azure. Get from `Base`'s `container_registry_password`
- `BASTION_SSH_PRIVATE_KEY`: The ssh private key to access the bastion host. Get it by connection to the bastion host using SSH, and generating a new public/private SSH key pair.

Additional Github Actions Secrets need to be set, as required by the [frontend application](../app/README.md#env-variables)
and injected by the corresponding [Github workflow](../.github/workflows/publish-marxan-docker-images.yml) that builds
the Frontend app docker image.

## How to deploy

Deploying the included Terraform project is done in steps:
- Terraform `apply` the `Remote State` project.
- Terraform `apply` the `Base` project.
- Modify your DNS Registar configuration to use the just created Azure DNS zone as a name server.
- Configure your local `kubectl` (you can use [this](https://docs.microsoft.com/en-us/cli/azure/aks?view=azure-cli-latest#az-aks-get-credentials))
- Configure network access to the AKS cluster and have a tunnel to AKS up and running 
(more on this [below](#network-access-to-azure-resources))
- Terraform `apply` the `Kubernetes` project.
- Create the PostgreSQL databases and users (more on this [here](#configuring-postgresql))


## Network access to Azure resources

For security reasons, most cloud resources are private, meaning they are attached to a private 
[virtual network](https://docs.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview),
and thus inaccessible from the internet. If you need access to these resources (for example, to configure
Kubernetes, either directly or through Terraform), there is a [Bastion host](https://en.wikipedia.org/wiki/Bastion_host)
available. Through it, you can establish an [SSH Tunnel](https://www.ssh.com/academy/ssh/tunneling/example)
that will set up a local port, that is securely proxied through said bastion, and can reach the desired target host.

Here's an example of how to run said tunnel on linux:

`ssh -N -L <local port>:<target resource hostname>:<target resource port> <bastion user>@<bastion hostname>`

You can now access the target cloud resource on your local host on the port specified above.


### Network access to AKS

Since access to the Azure AKS cluster is done through HTTPS, we need not only an SSH tunnel, but also a way
to match the hostname, so that the certificate can be validated successfully. There are a number of ways to tackle
this, but one of them is as follows:

- Modify your hosts file (`/etc/hosts` on linux) to resolve the Kubernetes hostname to `127.0.0.1`
- Modify your `kubectl` [configuration file](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/) 
to use a different port when reaching the AKS cluster (append `:<port number>` to the cluster hostname).
- Create an [SSH tunnel](#network-access-to-azure-resources) to that hostname, using the above specified port as
your local port.

You should now be able to use `kubectl` to access your AKS cluster.


## Configuring PostgreSQL

The included Terraform code sets up a PostgreSQL database server in the AKS cluster but, as it cannot reach it once 
it's set up, it won't create the necessary databases and users for the Marxan application to run, as well as enable
PostGIS. This has to be done manually:

- Use `kubectl` to open a terminal in the pod that is running the target PostgreSQL server.
- Create a database and a user with the corresponding credentials (see either the relevant 
[Kubernetes Secret](https://kubernetes.io/docs/concepts/configuration/secret/) or 
the [Azure Key Vault](https://azure.microsoft.com/en-us/services/key-vault/)).
- Enable the following extensions for that database, _before starting any
  backend services_, as the PostgreSQL user through which these services connect
  to the databases won't have permissions to enable the extensions via the
  `create extension` queries that are included in the migration scripts:
  - `pgcrypto`
    (`api/apps/api/src/migrations/api/1610395720000-AddSupportForAuthentication.ts`
    and
    `api/apps/geoprocessing/src/migrations/geoprocessing/1611828857842-AddFeatureScenarioOutputEntity.ts`)
  - `tablefunc` (`api/apps/geoprocessing/src/migrations/geoprocessing/1611221157285-InitialGeoDBSetup.ts`))
  - `plpgsql`(`api/apps/api/src/migrations/api/1608149578000-EnablePostgis.ts`)
  - `postgis` (`api/apps/api/src/migrations/api/1608149578000-EnablePostgis.ts`
    and
    `api/apps/geoprocessing/src/migrations/geoprocessing/1611221157285-InitialGeoDBSetup.ts`)
  - `postgis_raster` (`api/apps/geoprocessing/src/migrations/geoprocessing/1611221157285-InitialGeoDBSetup.ts`))
  - `postgis_topology` (`api/apps/geoprocessing/src/migrations/geoprocessing/1611221157285-InitialGeoDBSetup.ts`))
- Make sure the user has full access to the associated database.
- Repeat, as needed, for each database used by the project.

You may need to manually restart application pods once the PostgreSQL users and databases are in place, and verify
that they connect successfully.
