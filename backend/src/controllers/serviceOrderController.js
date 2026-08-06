import sequelize from "../config/db.js";
import redisClient from "../config/redis.js";
import {
  ServiceOrder,
  ServiceOrderPart,
  ServiceReception,
  Motorcycle,
  Customer,
  MotorcyclePart,
  InventoryMovement,
  User,
} from "../models/index.js";

const ORDER_INCLUDE = [
  {
    model: ServiceReception,
    include: [{ model: Motorcycle, include: [{ model: Customer }] }],
  },
  {
    model: ServiceOrderPart,
    include: [{ model: MotorcyclePart }],
  },
  { model: User, attributes: ["id", "fullName"] },
];

const recalculateOrderTotals = async (orderId, transaction) => {
  const lines = await ServiceOrderPart.findAll({
    where: { serviceOrderId: orderId },
    transaction,
  });
  const totalPartsCost = lines.reduce(
    (sum, line) => sum + Number(line.unitPrice) * line.quantityUsed,
    0,
  );

  const order = await ServiceOrder.findByPk(orderId, { transaction });
  order.totalPartsCost = totalPartsCost;
  order.totalCost = totalPartsCost + Number(order.laborCost);
  await order.save({ transaction });
};

export const getOrCreateOrder = async (req, res, next) => {
  try {
    const { receptionId } = req.params;

    const reception = await ServiceReception.findByPk(receptionId);
    if (!reception)
      return res.status(404).json({ message: "Recepción no encontrada" });

    let order = await ServiceOrder.findOne({
      where: { serviceReceptionId: receptionId },
      include: ORDER_INCLUDE,
    });

    if (!order) {
      const created = await ServiceOrder.create({
        serviceReceptionId: receptionId,
        userId: req.user.id,
      });
      order = await ServiceOrder.findByPk(created.id, {
        include: ORDER_INCLUDE,
      });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await ServiceOrder.findByPk(id, { include: ORDER_INCLUDE });
    if (!order) return res.status(404).json({ message: "Orden no encontrada" });
    res.json({ order });
  } catch (error) {
    next(error);
  }
};

export const updateOrderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { laborCost, notes } = req.body;

    const order = await ServiceOrder.findByPk(id);
    if (!order) return res.status(404).json({ message: "Orden no encontrada" });
    if (order.status === "CERRADA") {
      return res
        .status(400)
        .json({ message: "No se puede modificar una orden cerrada" });
    }

    if (laborCost !== undefined) order.laborCost = laborCost;
    if (notes !== undefined) order.notes = notes;
    order.totalCost = Number(order.laborCost) + Number(order.totalPartsCost);
    await order.save();

    const full = await ServiceOrder.findByPk(id, { include: ORDER_INCLUDE });
    res.json({ order: full });
  } catch (error) {
    next(error);
  }
};

export const addOrderPart = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { motorcyclePartId, quantityUsed } = req.body;

    if (!motorcyclePartId || !quantityUsed || Number(quantityUsed) < 1) {
      return res
        .status(400)
        .json({
          message: "motorcyclePartId y quantityUsed (>=1) son requeridos",
        });
    }

    const order = await ServiceOrder.findByPk(id);
    if (!order) return res.status(404).json({ message: "Orden no encontrada" });
    if (order.status === "CERRADA") {
      return res
        .status(400)
        .json({ message: "No se puede modificar una orden cerrada" });
    }

    const part = await MotorcyclePart.findByPk(motorcyclePartId);
    if (!part)
      return res.status(404).json({ message: "Refacción no encontrada" });

    await ServiceOrderPart.create({
      serviceOrderId: id,
      motorcyclePartId,
      quantityUsed,
      unitPrice: part.sellingPrice,
    });

    await recalculateOrderTotals(id);

    const full = await ServiceOrder.findByPk(id, { include: ORDER_INCLUDE });
    res.status(201).json({ order: full });
  } catch (error) {
    next(error);
  }
};

export const removeOrderPart = async (req, res, next) => {
  try {
    const { id, partLineId } = req.params;

    const order = await ServiceOrder.findByPk(id);
    if (!order) return res.status(404).json({ message: "Orden no encontrada" });
    if (order.status === "CERRADA") {
      return res
        .status(400)
        .json({ message: "No se puede modificar una orden cerrada" });
    }

    await ServiceOrderPart.destroy({
      where: { id: partLineId, serviceOrderId: id },
    });

    await recalculateOrderTotals(id);

    const full = await ServiceOrder.findByPk(id, { include: ORDER_INCLUDE });
    res.json({ order: full });
  } catch (error) {
    next(error);
  }
};

export const closeOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await ServiceOrder.findByPk(id, {
      include: [
        { model: ServiceOrderPart, include: [{ model: MotorcyclePart }] },
      ],
    });

    if (!order) return res.status(404).json({ message: "Orden no encontrada" });
    if (order.status === "CERRADA") {
      return res.status(400).json({ message: "La orden ya está cerrada" });
    }

    const insufficient = order.ServiceOrderParts.filter(
      (line) => line.MotorcyclePart.stockQuantity < line.quantityUsed,
    );

    if (insufficient.length > 0) {
      return res.status(409).json({
        message: "Stock insuficiente para cerrar la orden",
        parts: insufficient.map((line) => ({
          partCode: line.MotorcyclePart.partCode,
          description: line.MotorcyclePart.description,
          available: line.MotorcyclePart.stockQuantity,
          required: line.quantityUsed,
        })),
      });
    }

    await sequelize.transaction(async (t) => {
      for (const line of order.ServiceOrderParts) {
        const part = line.MotorcyclePart;

        part.stockQuantity -= line.quantityUsed;
        await part.save({ transaction: t });

        await InventoryMovement.create(
          {
            motorcyclePartId: part.id,
            movementType: "SALIDA",
            quantity: -line.quantityUsed,
            reason: `Consumo en orden de servicio #${order.id}`,
            serviceOrderId: order.id,
            userId: req.user.id,
          },
          { transaction: t },
        );
      }

      order.status = "CERRADA";
      order.closedAt = new Date();
      await order.save({ transaction: t });

      const reception = await ServiceReception.findByPk(
        order.serviceReceptionId,
        { transaction: t },
      );
      if (reception && ["EN_ESPERA", "EN_PROCESO"].includes(reception.status)) {
        reception.status = "LISTO";
        await reception.save({ transaction: t });
      }
    });

    await redisClient.del("inventory:list:all").catch(() => null);
    for (const line of order.ServiceOrderParts) {
      await redisClient
        .del(`inventory:part:${line.MotorcyclePart.id}`)
        .catch(() => null);
    }

    const full = await ServiceOrder.findByPk(id, { include: ORDER_INCLUDE });
    res.json({ order: full });
  } catch (error) {
    next(error);
  }
};
