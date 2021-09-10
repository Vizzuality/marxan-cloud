# Sending shapefile

```
curl -X POST "http://localhost:3030/api/v1/projects/:projectId/grid" -H  
"accept: 
application/json" -H  "Authorization: Bearer <<TOKEN>>" -H  "Content-Type: 
multipart/form-data" -F "file=shape.zip;type=application/zip"
```

ID returned from request can be ignored. In the future, it may be used to 
fetch status of the job directly.

# Getting status of the processing

Existing `GET projects/:id/scenarios/status` , extended with `jobs` property
which relate to project's jobs.

```
curl -X GET "http://localhost:3030/api/v1/projects/f63f3d3c-a25d-45de-969c
-954b1a375c38/scenarios/status" -H  "accept: application/json" -H  
"Authorization: Bearer <<TOKEN>>"
```

Example response:

```json
{
	"data": {
		"type": "project-jobs",
		"id": "f63f3d3c-a25d-45de-969c-954b1a375c38",
		"attributes": {
			"jobs": [
				{
					"kind": "grid",
					"status": "running",
					"data": {
						"payload": {
							"projectId": "f63f3d3c-a25d-45de-969c-954b1a375c38",
							"requestId": "d996e90a-6920-44ff-8f5d-061711e3d47f",
							"shapefile": {
								"path": "/tmp/storage/da6ad05e-98fa-45ae-b6c4-ac585072d0fc_grid-nam-shapefile.zip",
								"size": 19315,
								"encoding": "7bit",
								"filename": "da6ad05e-98fa-45ae-b6c4-ac585072d0fc_grid-nam-shapefile.zip",
								"mimetype": "application/zip",
								"fieldname": "file",
								"destination": "/tmp/storage",
								"originalname": "grid-nam-shapefile.zip"
							}
						}
					}
				}
			],
			"scenarios": []
		}
	}
}
```


