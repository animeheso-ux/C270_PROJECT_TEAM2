## Getting Started

### 1. Build the containers

```bash
docker compose build
```

To rebuild without using cache:

```bash
docker compose build --no-cache
```

---

### 2. Start the application

```bash
docker compose up -d
```

Or rebuild and start together:

```bash
docker compose up -d --build
```
