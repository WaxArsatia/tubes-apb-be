To install dependencies:

```sh
bun install
```

To run:

```sh
bun run dev
```

open http://localhost:3000

OpenAPI JSON: http://localhost:3000/doc

Swagger UI: http://localhost:3000/ui

Project structure:

```text
src/
	index.ts               # Runtime entrypoint + OpenAPI docs config
	routes/                # Route registration and OpenAPI route contracts
	controllers/           # HTTP-level orchestration and response mapping
	services/              # Business logic
	models/                # Data access layer (in-memory for now)
	schemas/               # Zod/OpenAPI request and response schemas
```
