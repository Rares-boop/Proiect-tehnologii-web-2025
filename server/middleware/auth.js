import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

export const requireMP = (req, res, next) => {
  if (req.user.role !== "MP") {
    return res
      .status(403)
      .json({ message: "Only MP users can perform this action" });
  }
  next();
};

export const requireTST = (req, res, next) => {
  if (req.user.role !== "TST") {
    return res
      .status(403)
      .json({ message: "Only TST users can perform this action" });
  }
  next();
};
