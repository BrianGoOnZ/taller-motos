-- ===================================================================
-- ESQUEMA v2 - Taller de Motocicletas y Refaccionaria
-- Normalizado: Customer y Motorcycle separados de ServiceReception.
-- Incluye InventoryMovement como bitácora de auditoría de stock.
-- ===================================================================

SET NAMES utf8mb4;
SET character_set_client = utf8mb4;

-- -------------------------------------------------------------
-- User (Autenticación)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `User` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `passwordHash` VARCHAR(255) NOT NULL,
  `fullName` VARCHAR(150) NOT NULL,
  `role` ENUM('admin', 'empleado', 'mecanico') NOT NULL DEFAULT 'empleado',
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- RefreshToken (control/revocación de sesiones)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `RefreshToken` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `tokenHash` VARCHAR(255) NOT NULL,
  `expiresAt` DATETIME NOT NULL,
  `isRevoked` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_refreshtoken_user` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Customer (dueño de la(s) motocicleta(s))
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Customer` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `fullName` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(150) NULL,
  `address` VARCHAR(255) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Motorcycle (vehículo, ligado a un Customer)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Motorcycle` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customerId` INT NOT NULL,
  `licensePlate` VARCHAR(20) NOT NULL,
  `brand` VARCHAR(50) NOT NULL,
  `model` VARCHAR(50) NOT NULL,
  `year` INT NULL,
  `color` VARCHAR(30) NULL,
  `vin` VARCHAR(50) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_motorcycle_customer` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- ServiceReception (Entrada/Salida del taller)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ServiceReception` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `motorcycleId` INT NOT NULL,
  `receivedByUserId` INT NULL,
  `reportedFailure` TEXT NOT NULL,
  `status` ENUM('EN_ESPERA', 'EN_PROCESO', 'LISTO', 'ENTREGADO') NOT NULL DEFAULT 'EN_ESPERA',
  `entryDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `exitDate` DATETIME NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reception_motorcycle` FOREIGN KEY (`motorcycleId`) REFERENCES `Motorcycle`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reception_user` FOREIGN KEY (`receivedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- MotorcyclePart (Inventario)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `MotorcyclePart` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `partCode` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NULL,
  `costPrice` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `sellingPrice` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `stockQuantity` INT NOT NULL DEFAULT 0,
  `minStockQuantity` INT NOT NULL DEFAULT 0,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- InventoryMovement (bitácora/auditoría de movimientos de stock)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `InventoryMovement` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `motorcyclePartId` INT NOT NULL,
  `movementType` ENUM('ENTRADA', 'SALIDA', 'AJUSTE') NOT NULL,
  `quantity` INT NOT NULL,
  `reason` VARCHAR(255) NULL,
  `serviceOrderId` INT NULL,
  `userId` INT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_movement_part` FOREIGN KEY (`motorcyclePartId`) REFERENCES `MotorcyclePart`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_movement_user` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- ServiceOrder (Orden de servicio)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ServiceOrder` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `serviceReceptionId` INT NOT NULL,
  `userId` INT NULL,
  `laborCost` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `totalPartsCost` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `totalCost` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `status` ENUM('ABIERTA', 'CERRADA') NOT NULL DEFAULT 'ABIERTA',
  `notes` TEXT NULL,
  `closedAt` DATETIME NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_serviceorder_reception` FOREIGN KEY (`serviceReceptionId`) REFERENCES `ServiceReception`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_serviceorder_user` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FK diferida de InventoryMovement -> ServiceOrder (se declara al final porque ServiceOrder se crea después)
ALTER TABLE `InventoryMovement`
  ADD CONSTRAINT `fk_movement_order` FOREIGN KEY (`serviceOrderId`) REFERENCES `ServiceOrder`(`id`) ON DELETE SET NULL;

-- -------------------------------------------------------------
-- ServiceOrderPart (detalle de refacciones consumidas por orden)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ServiceOrderPart` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `serviceOrderId` INT NOT NULL,
  `motorcyclePartId` INT NOT NULL,
  `quantityUsed` INT NOT NULL,
  `unitPrice` DECIMAL(10,2) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_orderpart_order` FOREIGN KEY (`serviceOrderId`) REFERENCES `ServiceOrder`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_orderpart_part` FOREIGN KEY (`motorcyclePartId`) REFERENCES `MotorcyclePart`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;