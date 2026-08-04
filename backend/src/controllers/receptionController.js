import {
  ServiceReception,
  Motorcycle,
  Customer,
  User,
} from "../models/index.js";

const RECEPTION_INCLUDE = [
  { model: Motorcycle, include: [{ model: Customer }] },
  { model: User, as: "receivedBy", attributes: ["id", "fullName"] },
];

const STATUS_FLOW = ["EN_ESPERA", "EN_PROCESO", "LISTO", "ENTREGADO"];

export const createReception = async (req, res, next) => {
  try {
    const { motorcycleId, reportedFailure } = req.body;

    if (!motorcycleId || !reportedFailure) {
      return res
        .status(400)
        .json({ message: "motorcycleId y reportedFailure son requeridos" });
    }

    const motorcycle = await Motorcycle.findByPk(motorcycleId);
    if (!motorcycle)
      return res.status(404).json({ message: "Motocicleta no encontrada" });

    const reception = await ServiceReception.create({
      motorcycleId,
      receivedByUserId: req.user.id,
      reportedFailure,
    });

    const full = await ServiceReception.findByPk(reception.id, {
      include: RECEPTION_INCLUDE,
    });

    res.status(201).json({ reception: full });
  } catch (error) {
    next(error);
  }
};

export const getReceptions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const receptions = await ServiceReception.findAll({
      where,
      include: RECEPTION_INCLUDE,
      order: [["entryDate", "DESC"]],
    });

    res.json({ receptions });
  } catch (error) {
    next(error);
  }
};

export const getReceptionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reception = await ServiceReception.findByPk(id, {
      include: RECEPTION_INCLUDE,
    });
    if (!reception)
      return res.status(404).json({ message: "Recepción no encontrada" });

    res.json({ reception });
  } catch (error) {
    next(error);
  }
};

export const updateReceptionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!STATUS_FLOW.includes(status)) {
      return res.status(400).json({ message: "Estatus inválido" });
    }

    const reception = await ServiceReception.findByPk(id);
    if (!reception)
      return res.status(404).json({ message: "Recepción no encontrada" });

    reception.status = status;
    if (status === "ENTREGADO") {
      reception.exitDate = new Date();
    }
    await reception.save();

    const full = await ServiceReception.findByPk(id, {
      include: RECEPTION_INCLUDE,
    });

    res.json({ reception: full });
  } catch (error) {
    next(error);
  }
};

//
