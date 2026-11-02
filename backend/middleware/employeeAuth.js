import jwt from "jsonwebtoken";
import Employee from "../models/employeeModels.js";

/**
 * Staff login check. Reads the JWT from the `token` header and sets `req.id`
 * to the employee's _id.
 *
 * It checks three things, not just the signature:
 *  - the token is an employee token (carries `id`) - a patient token, which is
 *    signed with the same secret but carries `contactNumber`, is refused;
 *  - the employee still exists;
 *  - the employee is not Inactive - a token issued before someone left must
 *    stop working at once, not when its 7 days run out.
 */
const employeeAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;
    const token = req.headers.token || bearerToken || req.query?.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing. Please login again",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }

    const employee = await Employee.findById(decoded.id)
      .select("personalDetails.status")
      .lean();

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: "This account no longer exists. Please login again",
        code: "INVALID_TOKEN",
      });
    }

    if (employee.personalDetails?.status === "Inactive") {
      return res.status(403).json({
        success: false,
        message: "This account is inactive",
        code: "ACCOUNT_INACTIVE",
      });
    }

    req.id = decoded.id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired please login again",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token",
      code: "INVALID_TOKEN",
    });
  }
};

export default employeeAuth;
