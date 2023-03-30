# Use compose plugin if available, fall back to docker-compose standalone
# executable
DOCKER_COMPOSE_COMMAND := $(shell { docker compose > /dev/null 2>&1 && echo "docker compose"; } || { docker-compose > /dev/null 2>&1 && echo "docker-compose"; } || echo "not_found")
ifeq ($(DOCKER_COMPOSE_COMMAND), not_found)
    $(error "Please install either the Compose plugin for Docker or the Docker Compose standalone binary")
endif
