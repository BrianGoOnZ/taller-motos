# Sistema de Administración - Taller de Motocicletas y Refaccionaria

## Stack
React 19 (Vite) + Express + MySQL 8.0 + Redis, containerizado con Docker.

## Arranque del entorno

1. Copiar variables de entorno:
   ```
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
2. Levantar los servicios:
   ```
   docker compose up --build
   ```
3. Servicios disponibles:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000
   - Documentación API (Swagger): http://localhost:5000/api-docs
   - Health check: http://localhost:5000/api/health
   - MySQL: localhost:3306
   - Redis: localhost:6379

## Esquema de base de datos

El esquema **vive en SQL puro**, no en Sequelize:
- `init.sql` (raíz del proyecto) — se ejecuta automáticamente solo la **primera vez** que Docker crea los datos en `mysql_data/`.
- Sequelize (`backend/src/models/`) solo se usa para consultar/mapear; no crea ni altera tablas.
- Convenciones del esquema: ver `CONVENTIONS.md`.

Si editas `init.sql` y `mysql_data/` ya existe, tienes que forzar un reinicio limpio:
```
docker compose down
rm -rf mysql_data
docker compose up --build
docker compose exec backend npm run seed:admin
```
Borrar `mysql_data/` elimina los datos actuales y hace que Docker vuelva a correr `init.sql` con tus cambios.

Recuerda mantener sincronizados manualmente el `.sql` y los archivos en `backend/src/models/` cuando agregues o cambies columnas.

## Estado actual

Infraestructura base + esquema borrador inicializados (Fase 0). Los campos de `MotorcyclePart`, `ServiceReception` y `ServiceOrder` son **provisionales**, pendientes de validar con el flujo real del taller. Pendiente: autenticación con doble token, e implementación de módulos de negocio (Inventario, Recepción, Órdenes de Servicio).

## Pendiente para fase de lanzamiento

- `docker-compose.prod.yml` separado (build optimizado, sin volúmenes de código montados, frontend servido como build estático en vez de Vite dev server). Se deja para cuando la app esté lista para salir a producción.
