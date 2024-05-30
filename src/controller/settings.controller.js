import { Layout } from "../models/layout.model.js";
import { Menu } from "../models/menu.model.js";
import { SubMenu } from "../models/subMenu.model.js";
import { errorHandler } from "../utils/error-handler.util.js";
import { responseHandler } from "../utils/response-handler.util.js";

export const getSettings = async (req, res) => {
    try {
        const menus =await Menu.find({ status: "active" });
        const subMenus = await SubMenu.find({ status: "active" });
        const layout = await Layout.find();
        const settings = {
            menus,
            subMenus,
            layout
        };
        responseHandler(200, "settings fetched successfully", settings, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};
