import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authenticated", success: false });
    }
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Not authenticated", success: false });
    }
    req.id = decoded.userId;
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ message: "Server Error", success: false });
  }
};

export default isAuthenticated;