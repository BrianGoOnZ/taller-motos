import { Motorcycle } from "../models/index.js";

export const createMotorcycle = async (req, res, next) => {
  try {
    const { customerId, licensePlate, brand, model, year, color, vin } =
      req.body;

    if (!customerId || !licensePlate || !brand || !model) {
      return res.status(400).json({
        message: "customerId, licensePlate, brand y model son requeridos",
      });
    }

    const motorcycle = await Motorcycle.create({
      customerId,
      licensePlate,
      brand,
      model,
      year: year || null,
      color: color || null,
      vin: vin || null,
    });

    res.status(201).json({ motorcycle });
  } catch (error) {
    next(error);
  }
};

//
