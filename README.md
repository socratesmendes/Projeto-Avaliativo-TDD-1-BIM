# To-Do CRUD

API REST de tarefas (criar, listar, consultar, alterar e excluir), em Spring Boot 4 e PostgreSQL. Projeto avaliativo do 1º bimestre de Laboratório de Desenvolvimento Multiplataforma, 6º DSM, Fatec Franca.

## Stack

- **Backend:** Java 21, Spring Boot 4, Spring Data JPA, Bean Validation, PostgreSQL, springdoc (Swagger UI).
- **Banco:** PostgreSQL 17, script único (`database/01-schema.sql`), usado pelo Docker, pelos testes e na execução manual.
- **Front:** React 19, TypeScript, Vite, TanStack Query, CSS Modules.
- **Docker:** três serviços (`postgres`, `backend`, `frontend`), cada um com seu Dockerfile.

## Como rodar

**Pré-requisitos:** JDK 21+ e Docker Desktop (modos 1 e 2); JDK 21+, Node 24+ e PostgreSQL, sem Docker (modo 3).

### 1. Docker completo (backend + banco + front)

```
cp .env.example .env
docker compose up --build
```

- Front: http://localhost:3000
- Swagger: http://localhost:8080/swagger-ui.html
- Health: http://localhost:8080/actuator/health

### 2. Desenvolvimento (banco no Docker, API e front locais)

```
docker compose up -d postgres
cd backend
./mvnw spring-boot:run
```

Em outro terminal:

```
cd frontend
npm install
npm run dev
```

- Front: http://localhost:5173 (proxy de `/api` para `localhost:8080`)

### 3. Manual, sem Docker

1. Conecte-se ao banco `postgres` e rode `database/00-create-database.sql`.
2. Conecte-se ao banco `todo` e rode `database/01-schema.sql`.
3. Defina `DB_URL`, `DB_USER` e `DB_PASSWORD` (ou use os defaults do `application.yml`: `jdbc:postgresql://localhost:5432/todo`, `todo`, `todo`).
4. `cd backend && ./mvnw spring-boot:run`.

## Como testar

```
cd backend
./mvnw test       # unitários, sem Docker
./mvnw verify      # unitários + integração, exige Docker ligado
```

```
cd frontend
npm install
npm test          # Vitest + Testing Library + MSW, sem backend nem Docker
npm run build      # checagem de tipos (tsc -b) + build de produção
```