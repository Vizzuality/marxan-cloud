.DEFAULT_GOAL := seed-data

# Seed data for production/staging environments
seed-data: seed-gadm seed-wdpa seed-ecosystems

# Seed data for development environments (includes IUCN species data and other
# demo/test data for development convenience)
seed-data-dev: seed-gadm seed-wdpa seed-demo-features-species seed-demo-features-bioregion seed-ecosystems

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

seed-demo-features-species:
	@echo "Starting seeding features from demo data... "
	@time $(MAKE) -C ./demo_data_features_species import

seed-demo-features-bioregion:
	@echo "Starting seeding features from demo data... "
	@time $(MAKE) -C ./demo_data_features_bioregion import

