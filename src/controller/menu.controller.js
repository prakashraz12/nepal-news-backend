import { Menu } from "../models/menu.model.js";
import { SubMenu } from "../models/subMenu.model.js";
import { errorHandler } from "../utils/error-handler.util.js";
import { responseHandler } from "../utils/response-handler.util.js";

// cretae menu
export const createMenu = async (req, res) => {
    const { menuTitle, menuOrder, status,isShownOnNavbar, layout  } = req.body;

    if (!menuTitle || !menuOrder || !status) {
        return errorHandler(500, "Menu title, order, status  is required", res);
    }

    try {
        const findMenu = await Menu.findOne({
            $or: [{ menuTitle }, { menuOrder }],
        });

        if (findMenu) {
            return errorHandler(
                500,
                "Menu title, or Order is already existed",
                res
            );
        }
        const newMenu = new Menu({
            menuTitle,
            menuOrder,
            status,
            layout,
            isShownOnNavbar
        });
        await newMenu.save();
        return responseHandler(201, "Menu created successfully", newMenu, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

// menu update
export const updateMenu = async (req, res) => {
    const { id } = req.params;
    const { title, order } = req.body;

    if (!title || !order) {
        return errorHandler(
            400,
            "Menu title and order number are required",
            res
        );
    }

    try {
        const menu = await Menu.findById(id);

        if (!menu) {
            return errorHandler(404, "Menu not found", res);
        }

        menu.title = title;
        menu.order = order;

        await menu.save();

        return responseHandler(200, "Menu updated successfully", menu, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

// delete menu
export const deleteMenu = async (req, res) => {
    const { id } = req.params;

    try {
        const menu = await Menu.findById(id);

        const findSubMenu = await SubMenu.find({ menu: menu?._id });

        if (!menu) {
            return errorHandler(404, "Menu not found", res);
        }

        // Delete each submenu
        for (const submenu of findSubMenu) {
            await submenu.remove();
        }

        // Now delete the main menu
        await menu.remove();

        return responseHandler(
            200,
            "Menu and associated submenus deleted successfully",
            null,
            res
        );
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

//searech menus
export const getListOfMenus = async (req, res) => {
    try {
        const { page, rowsPerPage, menuTitle, status } = req.body;
        // Build query object for filtering
        const query = {};
        if (menuTitle) {
            query.menuTitle = { $regex: menuTitle, $options: "i" };
        }
        if (status) {
            query.status = status;
        }
        // Count total number of documents
        const totalMenus = await Menu.countDocuments();

        // Calculate skip and limit values for pagination
        const skip = (page - 1) * rowsPerPage;
        const limit = parseInt(rowsPerPage);

        // Find matching documents with pagination
        const menus = await Menu.find(query).skip(skip).limit(limit);

        const responseData = {
            menus,
            totalMenus,
        };

        return responseHandler(
            200,
            "menu fetched successfully",
            responseData,
            res
        );
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};
