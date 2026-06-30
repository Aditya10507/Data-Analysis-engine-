COMPOSE ?= docker compose

.PHONY: dev build migrate test

dev:
	$(COMPOSE) up --build

build:
	$(COMPOSE) build

migrate:
	$(COMPOSE) run --rm backend alembic -c alembic.ini upgrade head

test:
	$(COMPOSE) run --rm backend python -m compileall app alembic
	$(COMPOSE) run --rm frontend nginx -t
