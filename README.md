# Finora Mock API

Deterministic NestJS mock backend for the Finora business-account onboarding frontend assessment.

## Requirements

- Node.js **24** (`.nvmrc` → `24.21.0`)
- NVM recommended

## Setup

```bash
nvm install
nvm use
npm install
```

## Development

```bash
npm run dev
```

Server listens on `http://localhost:4000` by default (`PORT` in `.env`).

Production-style run:

```bash
npm run build
npm start
```

## Testing

```bash
npm test
npm run typecheck
npm run lint
```

## Swagger

- UI: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- OpenAPI JSON: [http://localhost:4000/api/docs-json](http://localhost:4000/api/docs-json)

## API endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/applications` | List (`search`, `status` query params) |
| `GET` | `/api/applications/:id` | Get full application |
| `POST` | `/api/applications` | Create draft |
| `PATCH` | `/api/applications/:id` | Partial draft update |
| `POST` | `/api/applications/:id/submit` | Submit (full validation) |
| `GET` | `/api/reference/countries` | Countries |
| `GET` | `/api/reference/industries` | Industries |
| `GET` | `/api/reference/transfer-countries` | Transfer countries |

## Error responses

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Some fields are invalid.",
    "fields": {
      "legalName": "Business name is required."
    }
  }
}
```

| HTTP | Code |
| --- | --- |
| 400 | `BAD_REQUEST` / malformed input |
| 422 | `VALIDATION_ERROR` |
| 404 | `NOT_FOUND` |
| 409 | `CONFLICT` |
| 500 | `INTERNAL_ERROR` |

## Mock scenarios

Send header `X-Mock-Scenario`:

| Value | Behavior |
| --- | --- |
| `normal` / omitted | Normal behavior |
| `slow` | ~2.5s delay |
| `server-error` | HTTP 500 |
| `validation-error` | HTTP 422 with field errors |
| `conflict` | HTTP 409 |

## Architecture

`Controller → Zod validation → Service → in-memory Repository → JSON`

OpenAPI metadata lives in `*.swagger.ts` files and is applied via the `@ApiDocs(...)` decorator.

## Completion percentage

Eight onboarding steps. Each completed step contributes equally (rounded). `currentStep` is the first incomplete step (1-based), or `8` when complete.

## Lifecycle

- `DRAFT` — editable
- `SUBMITTED` — read-only; further PATCH/submit → `409`

## Frontend integration

Point the Next.js app at `http://localhost:4000`. Load reference data asynchronously. Persist drafts with `PATCH`. Map `error.fields` into forms. Exercise loading/error UI via `X-Mock-Scenario`.
