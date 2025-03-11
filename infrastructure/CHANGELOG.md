# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic
Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.2

Unreleased

### Added

### Changed

- Azure SKU for the IP resource for the bastion host has been upgraded to use
  the Standard SKU, in preparation for the [upcoming deprecation of the Basic
  SKU](https://learn.microsoft.com/en-us/answers/questions/1033456/retirement-announcement-basic-sku-public-ip-addres)
  ([MRXNM-66](https://vizzuality.atlassian.net/browse/MRXNM-66)).

### Fixed

### Deprecated

### Removed

## 1.0.1

(No release date)

### Changed

- Upgrade cert-manager chart to latest patch release in the v1.12 series. This
  fixed an issue with certificates not being renewed
  ([MRXNM-53](https://vizzuality.atlassian.net/browse/MRXNM-53)).
