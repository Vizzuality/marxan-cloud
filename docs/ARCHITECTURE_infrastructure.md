# Infrastructure architecture - Marxan Cloud platform

This document describes the current high-level architecture of the cloud
infrastructure for the Marxan Cloud platform.

With the Marxan Cloud platform we aim to bring to the planet the finest
workflows and insights for conservation planning, building upon the Marxan
conservation planning software and a range of relevant geospatial data sources,
combined with user-provided data and project-specific situated knowledge.

One or more "flagship" Marxan Cloud instances will provide conservation planning
infrastructure for organizations, government agencies and academic institutions
who wish to rely on the benefits of a SaaS platform.

Additionally, the MIT-licensed codebase, combined with IaC (Infrastructure as
Code) workflows on commodity cloud infrastructure (Kubernetes, with primary
target the Azure AKS platform) will allow organizations to set up private
instances of the Marxan Cloud platform, whether on public or private cloud or
on-premises.

## Key principles and operational constraints

From an architectural standpoint, the key principles we focus on are:

- Just enough complexity

We aim to balance complex requirements with the goal of keeping implementation
complexity to a suitable minimum.

- Reliance on shared concepts

For example, the use of Kubernetes as an DevOps platform, or Airflow as
orchestration engine for data pipelines. Besides the operational leverage, these
and other frameworks we choose should also help both onboard developers to the
project, as well as making it easier for independent organizations to deploy
their own instances, relying on commodity cloud services such as Azure AKS.

- Scalability

During project discovery phase, we identified the following key traits for the
expected platform performance profile:

  - linear growth of user base (or ability to keep growth linear via horizontal
    scaling, by partitioning projects or organizations across instances)
  - mostly CPU-bound, long running async tasks (geodata processing, ETL
    pipelines, Marxan runs) with potential hig-mem computation requirements
  - three main kinds of async tasks:
    1. initial geodata ingestion and processing + periodic/scheduled updates
    2. per-project/per-scenario geodata ingestion and processing
    3. Marxan calculations
  - low per-user count of tasks of kind #2 and #3, with occasional bursts during
    periods of intense active work on Marxan scenarios

- Tenant isolation

Marxan Cloud is a multi-tenant platform; logical isolation of data is provided
via hierarchical grouping of entities (scenarios belong to projects; users may
belong to organizations; projects can be associated to users or organizations -
where organizations may be actually implemented at a later stage). However, all
tenants of a Marxan Cloud instance do share computational resources (Kubernetes
clusters, PostGIS workloads, Airflow executor resources, etc.).

The Marxan Cloud distribution provides the ability to spin up fully independent
instances via Terraform and Helm workflows, thus allowing users to benefit from
full resource isolation, where either data security requirements or performance
requirements make the use of multi-tenant instances unsuitable.

## System contexts

With reference to the C4 model, the current Marxan Cloud architecture spans over
four key system contexts:

- End users (planners)
- Platform administrators (these include administrators proper, devops and
  developer teams)
- The Marxan Cloud "application" proper (frontend and backend API)
- Data pipelines

These are shown (though not yet fully articulated in C4 logical terms, please
bear with us!) here:

![Marxan Cloud platform - contexts](./ARCHITECTURE_infrastructure/marxan-contexts.png)

### Data layer and multi-tenant isolation

Within the API subsystem, the core data layer is split between two distinct
PostgreSQL cloud database instances for resource isolation purposes:

- *Database* stores user, project, scenario metadata
- *GeoDatabase* stores scenario geo data and performs CPU-bound geoprocessing
  tasks

We will evaluate performance metrics, job latency, priority handling, etc. in
live instances of the platform to inform a possible decision, in later project
phases, on whether to provide physical tenant isolation for geoprocessing only,
e.g. by orchestrating the creation and eventual teardown of per-organization or
per-project PostgreSQL cloud database instances for the *GeoDatabase*.


