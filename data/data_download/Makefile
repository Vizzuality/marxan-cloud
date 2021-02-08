# Usage:
# make        # compile all binary
# make clean  # remove ALL binaries and objects

.PHONY: seed-data seed-gadm seed-wdpa seed-iucn seed-ecosystems
.DEFAULT_GOAL := seed-data

seed-data: seed-gadm
# seed-wdpa seed-iucn seed-ecosystems

seed-gadm:
	@echo "Starting seeding gadm data... "
	$(MAKE) -C ./gadm_3.6 import

seed-wdpa:
	@echo "Starting seeding wdpa data... "
	$(MAKE) -C ./wdpa import

seed-iucn:
	@echo "Starting seeding iucn data... "
	$(MAKE) -C ./iucn import

seed-ecosystems:
	@echo "Starting seeding ecosystems data... "
	$(MAKE) -C ./WorldTerrestrialEcosystems/Makefile import
