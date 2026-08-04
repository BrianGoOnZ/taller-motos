import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    return res.status(401).json({ message: "No autenticado" });
  }

  try {
    const payload = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: "Sesión expirada" });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "No tienes permisos para esta acción" });
    }
    next();
  };
};

// Contiene los guardias de seguridad protect (verifica que el JWT de la cookie sea válido)
// y authorize (restringe acciones según el rol del usuario).
