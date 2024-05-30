import { Layout } from "../models/layout.model.js";
import { errorHandler } from "../utils/error-handler.util.js";
import { responseHandler } from "../utils/response-handler.util.js";

export const createLayout = async (req, res) => {
    try {
        const { layoutTitle } = req.body;
        if (!layoutTitle) {
            return errorHandler(500, "menu ttile is required", res);
        }
        const layOut = Layout({
            layoutTitle,
        });
        await layOut.save();
        responseHandler(201, "layout created", layOut, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};


