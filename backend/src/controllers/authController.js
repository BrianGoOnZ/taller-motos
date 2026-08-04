import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, RefreshToken } from "../models/index.js";
import sequelize from "../config/db.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  getRefreshExpiryDate,
} from "../utils/tokenUtils.js";

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 15 * 60 * 1000,
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 8 * 60 * 60 * 1000,
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Usuario y contraseña son requeridos" });
    }

    const user = await User.findOne({ where: { username } });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await sequelize.transaction(async (t) => {
      await RefreshToken.update(
        { isRevoked: true },
        { where: { userId: user.id, isRevoked: false }, transaction: t },
      );

      await RefreshToken.create(
        {
          userId: user.id,
          tokenHash: hashToken(refreshToken),
          expiresAt: getRefreshExpiryDate(),
        },
        { transaction: t },
      );
    });

    res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: "No hay sesión activa" });
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res
        .status(401)
        .json({ message: "Sesión expirada, inicia sesión de nuevo" });
    }

    const tokenHash = hashToken(refreshToken);
    const storedToken = await RefreshToken.findOne({
      where: { userId: payload.id, tokenHash, isRevoked: false },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res
        .status(401)
        .json({ message: "Sesión expirada, inicia sesión de nuevo" });
    }

    const user = await User.findByPk(payload.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Usuario no válido" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await sequelize.transaction(async (t) => {
      storedToken.isRevoked = true;
      await storedToken.save({ transaction: t });

      await RefreshToken.create(
        {
          userId: user.id,
          tokenHash: hashToken(newRefreshToken),
          expiresAt: getRefreshExpiryDate(),
        },
        { transaction: t },
      );
    });

    res.cookie("accessToken", newAccessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({ message: "Token renovado" });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await RefreshToken.update({ isRevoked: true }, { where: { tokenHash } });
    }

    res.clearCookie("accessToken", ACCESS_COOKIE_OPTIONS);
    res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);

    res.json({ message: "Sesión cerrada correctamente" });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "username", "fullName", "role", "isActive"],
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Gestiona el acceso al sistema (login, refresh, logout, me).
// Implementa RefreshToken Rotation y cookies seguras httpOnly.
