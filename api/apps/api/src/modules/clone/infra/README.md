both:
* `/clone/export/adapters` 
* `/clone/infra`

are actually  adapters/infrastructure - the separation comes only due to 
those within `infra` are reaching "outside" of the API (this is - do things 
around queues/jobs and are not directly used by `applications`'s use cases)
