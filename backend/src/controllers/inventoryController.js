import { Op } from "sequelize";
import sequelize from "../config/db.js";
import { MotorcyclePart, InventoryMovement, User } from "../models/index.js";
import redisClient, { CACHE_TTL_SECONDS } from "../config/redis.js";

const LIST_CACHE_KEY = "inventory:list:all";
const partCacheKey = (id) => `inventory:part:${id}`;

const invalidatePartCache = async (id) => {
  await redisClient.del(LIST_CACHE_KEY);
  if (id) await redisClient.del(partCacheKey(id));
};

export const getParts = async (req, res, next) => {
  try {
    const { search, category, includeInactive } = req.query;

    const isCacheable = !search && !category && !includeInactive;

    if (isCacheable) {
      const cached = await redisClient.get(LIST_CACHE_KEY).catch(() => null);
      if (cached) {
        return res.json({ parts: JSON.parse(cached), fromCache: true });
      }
    }

    const where = {};
    if (!includeInactive) where.isActive = true;
    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { partCode: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const parts = await MotorcyclePart.findAll({
      where,
      order: [["description", "ASC"]],
    });

    if (isCacheable) {
      await redisClient
        .set(LIST_CACHE_KEY, JSON.stringify(parts), { EX: CACHE_TTL_SECONDS })
        .catch(() => null);
    }

    res.json({ parts, fromCache: false });
  } catch (error) {
    next(error);
  }
};

export const getPartById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cached = await redisClient.get(partCacheKey(id)).catch(() => null);
    if (cached) {
      return res.json({ part: JSON.parse(cached), fromCache: true });
    }

    const part = await MotorcyclePart.findByPk(id);
    if (!part)
      return res.status(404).json({ message: "Refacción no encontrada" });

    await redisClient
      .set(partCacheKey(id), JSON.stringify(part), { EX: CACHE_TTL_SECONDS })
      .catch(() => null);

    res.json({ part, fromCache: false });
  } catch (error) {
    next(error);
  }
};

export const createPart = async (req, res, next) => {
  try {
    const {
      partCode,
      description,
      category,
      costPrice,
      sellingPrice,
      stockQuantity,
      minStockQuantity,
    } = req.body;

    if (!partCode || !description) {
      return res
        .status(400)
        .json({ message: "partCode y description son requeridos" });
    }

    const existing = await MotorcyclePart.findOne({ where: { partCode } });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Ya existe una refacción con ese código" });
    }

    const initialStock = Number(stockQuantity) || 0;

    const part = await sequelize.transaction(async (t) => {
      const newPart = await MotorcyclePart.create(
        {
          partCode,
          description,
          category: category || null,
          costPrice: costPrice || 0,
          sellingPrice: sellingPrice || 0,
          stockQuantity: initialStock,
          minStockQuantity: minStockQuantity || 0,
        },
        { transaction: t },
      );

      if (initialStock > 0) {
        await InventoryMovement.create(
          {
            motorcyclePartId: newPart.id,
            movementType: "ENTRADA",
            quantity: initialStock,
            reason: "Alta inicial de inventario",
            userId: req.user.id,
          },
          { transaction: t },
        );
      }

      return newPart;
    });

    await invalidatePartCache();

    res.status(201).json({ part });
  } catch (error) {
    next(error);
  }
};

export const updatePart = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stockQuantity, adjustmentReason, ...otherFields } = req.body;

    const part = await MotorcyclePart.findByPk(id);
    if (!part)
      return res.status(404).json({ message: "Refacción no encontrada" });

    await sequelize.transaction(async (t) => {
      if (
        stockQuantity !== undefined &&
        Number(stockQuantity) !== part.stockQuantity
      ) {
        const delta = Number(stockQuantity) - part.stockQuantity;

        await InventoryMovement.create(
          {
            motorcyclePartId: part.id,
            movementType: "AJUSTE",
            quantity: delta,
            reason: adjustmentReason || "Ajuste manual de inventario",
            userId: req.user.id,
          },
          { transaction: t },
        );

        part.stockQuantity = stockQuantity;
      }

      Object.assign(part, otherFields);
      await part.save({ transaction: t });
    });

    await invalidatePartCache(id);

    res.json({ part });
  } catch (error) {
    next(error);
  }
};

export const deletePart = async (req, res, next) => {
  try {
    const { id } = req.params;

    const part = await MotorcyclePart.findByPk(id);
    if (!part)
      return res.status(404).json({ message: "Refacción no encontrada" });

    part.isActive = false;
    await part.save();

    await invalidatePartCache(id);

    res.json({ message: "Refacción desactivada correctamente" });
  } catch (error) {
    next(error);
  }
};

export const getPartMovements = async (req, res, next) => {
  try {
    const { id } = req.params;

    const movements = await InventoryMovement.findAll({
      where: { motorcyclePartId: id },
      include: [{ model: User, attributes: ["id", "fullName", "username"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json({ movements });
  } catch (error) {
    next(error);
  }
};

// Administra el catálogo de refacciones y el stock. Integra aceleración con caché en Redis
// y registra automáticamente los movimientos de inventario (entradas, salidas, ajustes).
