# Convenciones del esquema (init.sql)

Estas reglas aplican a **toda** tabla nueva que se agregue en `init.sql` (raíz del proyecto).
El objetivo es que cualquier tabla se vea "predecible" sin tener que rediscutir el formato cada vez.

## 1. Nombres
- Tabla: PascalCase singular → `User`, `MotorcyclePart`, `ServiceOrder`.
- Columna: camelCase → `customerName`, `stockQuantity`, `isActive`.
- Sin abreviaturas ambiguas (`qty` no, `quantity` sí).

## 2. Llave primaria
Toda tabla usa:
```sql
`id` INT AUTO_INCREMENT PRIMARY KEY,
```

## 3. Timestamps obligatorios
Toda tabla termina sus columnas propias con:
```sql
`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
`updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

## 4. Borrado lógico, no físico (para catálogos de negocio)
Tablas que representan catálogos o entidades que no deben perderse (`User`, `MotorcyclePart`) usan:
```sql
`isActive` BOOLEAN NOT NULL DEFAULT TRUE
```
en vez de un `DELETE` real. Tablas puramente técnicas (ej. `RefreshToken`) sí pueden borrarse físicamente.

## 5. Dinero
Siempre `DECIMAL(10,2)`, nunca `FLOAT` ni `DOUBLE` (evita errores de redondeo).

## 6. Llaves foráneas
- Nombre de constraint: `fk_<tablaHija>_<tablaPadre>` en minúsculas.
- Siempre se declara `ON DELETE` explícito (`CASCADE`, `SET NULL` o `RESTRICT` — se decide caso por caso, nunca se deja el default implícito).

## 7. Estados de flujo (status)
Se usa `ENUM(...)` solo cuando el flujo es cerrado y conocido de antemano (ej. estatus de una orden). Si el catálogo puede crecer con el tiempo (ej. tipos de refacción), se usa `VARCHAR` o tabla aparte, no `ENUM`.

## 8. Charset
Toda tabla termina con:
```sql
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 9. Organización de archivos
- `init.sql` (raíz) → toda la estructura de tablas. Si crece mucho, se puede separar por bloques dentro del mismo archivo con comentarios `-- ==` como secciones.
- Los datos semilla de catálogos fijos (si se necesitan) van en el mismo `init.sql`, al final. Usuarios NO van aquí, esos se crean con `npm run seed:admin`.

## 10. Flujo de cambios
1. Editas `init.sql`.
2. `docker compose down && rm -rf mysql_data && docker compose up --build` (recrea los datos desde cero).
3. Actualizas el modelo Sequelize (`backend/src/models/*.js`) para que coincida exactamente con las columnas del `.sql`.

No hay sincronización automática entre SQL y Sequelize — es manual y a propósito, para que el `.sql` sea siempre la única fuente de verdad.
