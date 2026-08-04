import User from "./User.js";
import RefreshToken from "./RefreshToken.js";
import Customer from "./Customer.js";
import Motorcycle from "./Motorcycle.js";
import MotorcyclePart from "./MotorcyclePart.js";
import InventoryMovement from "./InventoryMovement.js";
import ServiceReception from "./ServiceReception.js";
import ServiceOrder from "./ServiceOrder.js";
import ServiceOrderPart from "./ServiceOrderPart.js";

// User <-> RefreshToken
User.hasMany(RefreshToken, { foreignKey: "userId", onDelete: "CASCADE" });
RefreshToken.belongsTo(User, { foreignKey: "userId" });

// Customer <-> Motorcycle
Customer.hasMany(Motorcycle, { foreignKey: "customerId", onDelete: "CASCADE" });
Motorcycle.belongsTo(Customer, { foreignKey: "customerId" });

// Motorcycle <-> ServiceReception
Motorcycle.hasMany(ServiceReception, {
  foreignKey: "motorcycleId",
  onDelete: "CASCADE",
});
ServiceReception.belongsTo(Motorcycle, { foreignKey: "motorcycleId" });

// User <-> ServiceReception (quién recibió la moto)
User.hasMany(ServiceReception, { foreignKey: "receivedByUserId" });
ServiceReception.belongsTo(User, {
  foreignKey: "receivedByUserId",
  as: "receivedBy",
});

// ServiceReception <-> ServiceOrder
ServiceReception.hasOne(ServiceOrder, {
  foreignKey: "serviceReceptionId",
  onDelete: "CASCADE",
});
ServiceOrder.belongsTo(ServiceReception, { foreignKey: "serviceReceptionId" });

// User <-> ServiceOrder (mecánico/responsable)
User.hasMany(ServiceOrder, { foreignKey: "userId" });
ServiceOrder.belongsTo(User, { foreignKey: "userId" });

// ServiceOrder <-> MotorcyclePart (N:M vía ServiceOrderPart)
ServiceOrder.hasMany(ServiceOrderPart, {
  foreignKey: "serviceOrderId",
  onDelete: "CASCADE",
});
ServiceOrderPart.belongsTo(ServiceOrder, { foreignKey: "serviceOrderId" });

MotorcyclePart.hasMany(ServiceOrderPart, { foreignKey: "motorcyclePartId" });
ServiceOrderPart.belongsTo(MotorcyclePart, { foreignKey: "motorcyclePartId" });

// MotorcyclePart <-> InventoryMovement
MotorcyclePart.hasMany(InventoryMovement, {
  foreignKey: "motorcyclePartId",
  onDelete: "CASCADE",
});
InventoryMovement.belongsTo(MotorcyclePart, { foreignKey: "motorcyclePartId" });

// ServiceOrder <-> InventoryMovement (movimiento originado por cierre de orden)
ServiceOrder.hasMany(InventoryMovement, { foreignKey: "serviceOrderId" });
InventoryMovement.belongsTo(ServiceOrder, { foreignKey: "serviceOrderId" });

// User <-> InventoryMovement (quién hizo el movimiento)
User.hasMany(InventoryMovement, { foreignKey: "userId" });
InventoryMovement.belongsTo(User, { foreignKey: "userId" });

// El esquema real vive en init.sql (raíz del proyecto).
// Sequelize NO crea ni altera tablas: solo se usa para consultar/mapear.
// Si agregas/cambias columnas, edita el .sql y refleja el cambio aquí manualmente.

export {
  User,
  RefreshToken,
  Customer,
  Motorcycle,
  MotorcyclePart,
  InventoryMovement,
  ServiceReception,
  ServiceOrder,
  ServiceOrderPart,
};
