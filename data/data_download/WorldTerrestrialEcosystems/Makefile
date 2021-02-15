.PHONY: import



import: data/ecosystems/World_Ecosystems_simp.geojson



data/ecosystems/World_Ecosystems_simp.geojson: data/ecosystems/World_Ecosystems.geojson
	mapshaper $< -simplify 10% -filter-islands min-vertices=3 -filter-slivers -clean -o $@ force

data/ecosystems/World_Ecosystems.geojson: data/ecosystems/World_Ecosystems.tif
	gdal_polygonize $< -f GeoJSONSeq $@

data/ecosystems/World_Ecosystems.tif: | data/ecosystems
	cd data && curl -O https://esri.maps.arcgis.com/sharing/rest/content/items/12230625b4d8409982f1361a1c03270f/data

data/ecosystems:
	mkdir -p $@

clean:
	rm -rf data/
