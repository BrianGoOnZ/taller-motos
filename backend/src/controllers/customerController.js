import { Op } from "sequelize";
import { Customer, Motorcycle } from "../models/index.js";

export const searchCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const where = { isActive: true };

    if (search) {
      where[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const customers = await Customer.findAll({
      where,
      limit: 10,
      order: [["fullName", "ASC"]],
    });
    res.json({ customers });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const { fullName, phone, email, address } = req.body;

    if (!fullName || !phone) {
      return res
        .status(400)
        .json({ message: "fullName y phone son requeridos" });
    }

    const customer = await Customer.create({
      fullName,
      phone,
      email: email || null,
      address: address || null,
    });

    res.status(201).json({ customer });
  } catch (error) {
    next(error);
  }
};

export const getCustomerMotorcycles = async (req, res, next) => {
  try {
    const { id } = req.params;

    const motorcycles = await Motorcycle.findAll({
      where: { customerId: id, isActive: true },
      order: [["createdAt", "DESC"]],
    });

    res.json({ motorcycles });
  } catch (error) {
    next(error);
  }
};

//
