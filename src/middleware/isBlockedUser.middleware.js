import { User } from "../models/user.model.js";
import { errorHandler } from "../utils/error-handler.util.js";


export const isBlockedUser = async (req, res, next) => {
    try {
        const user = req.user;
        const findUser = await User.findById(user);
        const isBlocked = findUser.isBlocked;
        if (isBlocked) {
            return errorHandler(403, "your account is blocked!", res);
        }
        next();
    } catch (error) {
        errorHandler(500, error?.message, res);
    }
};
