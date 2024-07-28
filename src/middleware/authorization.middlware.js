import { errorHandler } from "../utils/error-handler.util.js";

export const verifyRole = (requiredRoles) => {
    return async (req, res, next) => {
        const role = req.role;
        if (requiredRoles.includes(role)) {
            next();
        } else {
            return errorHandler(500, "you are not authorized Person", res);
        }
    };
};
