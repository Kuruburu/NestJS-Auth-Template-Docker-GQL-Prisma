CONTAINER=auth-template-api
DB_CONTAINER=postgres
COMPOSE_FILE=docker-compose.yml

db-push:
	docker exec -it $(CONTAINER) npm run db:push

db-migrate:
	# docker exec -it $(CONTAINER) npm run db:migrate
	docker exec -it $(CONTAINER) npx prisma migrate dev --name init

db-reset:
	docker exec -it $(CONTAINER) npm run db:reset

logs:
	docker logs -f $(CONTAINER)

restart:
	docker restart $(CONTAINER)

fresh-start:
	@echo "🛑 Stopping and removing old containers..."
	docker-compose -f $(COMPOSE_FILE) down -v

	@echo "🐳 Starting fresh containers..."
	docker-compose -f $(COMPOSE_FILE) up -d --build

	@echo "⏳ Waiting for Postgres to be ready..."
	docker-compose -f $(COMPOSE_FILE) exec -T $(DB_CONTAINER) bash -c 'until pg_isready -U $$POSTGRES_USER; do sleep 3; done'

	# docker exec -it $(CONTAINER) npx prisma migrate reset --force && npx prisma migrate dev 

	@echo "📜 Running migrations..."
	docker exec -it $(CONTAINER) npx prisma migrate dev --name init

	@echo "Running seeds..."
	docker exec -it $(CONTAINER) npx prisma db seed 

	# @echo "🌱 Seeding the database..."
	# docker exec -it $(CONTAINER) npx ts-node prisma/seed.ts

	@echo "✅ Fresh start complete!"

