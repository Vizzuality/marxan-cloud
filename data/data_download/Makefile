.DEFAULT_GOAL := seed-data


seed-data: seed-gadm seed-wdpa seed-ecosystems

seed-gadm:
	@echo "Starting seeding gadm data... "
	@time $(MAKE) -C ./gadm_3.6 import

seed-wdpa:
	@echo "Starting seeding wdpa data... "
	@time $(MAKE) -C ./wdpa import

seed-iucn:
	@echo "Starting seeding iucn data... "
	@time $(MAKE) -C ./iucn import

seed-ecosystems:
	@echo "Starting seeding ecosystems data... "
	@time $(MAKE) -C ./world_terrestrial_ecosystems import
