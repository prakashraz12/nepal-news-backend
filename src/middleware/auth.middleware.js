import { errorHandler } from "../utils/error-handler.util.js";
import jwt from "jsonwebtoken"; // Importing jwt for token verification

export const verifyJWT = async (req, res, next) => {

    try {
        const token = req.cookies.token;
        if (!token) {
            errorHandler(403, "Please login first", res);
            return; 
        }

        // Verify the JWT token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                errorHandler(403, "Invalid or expired token", res);
                return;
            }
            req.user = decoded?.userId;
            req.role = decoded?.role;
            console.log(req.role)
            next();
        });
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};
