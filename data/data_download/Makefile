
#Q=@  Set to not display command names
TIME =eval time
.DEFAULT_GOAL := seed-data

seed-data: seed-gadm seed-wdpa seed-iucn seed-ecosystems

seed-gadm:
	@echo "Starting seeding gadm data... "
	@$(TIME) $(MAKE) -C ./gadm_3.6 import

seed-wdpa:
	@echo "Starting seeding wdpa data... "
	@$(TIME) $(MAKE) -C ./wdpa import

seed-iucn:
	@echo "Starting seeding iucn data... "
	@$(TIME) $(MAKE) -C ./iucn import

seed-ecosystems:
	@echo "Starting seeding ecosystems data... "
	@$(TIME) $(MAKE) -C ./world_terrestrial_ecosystems import
