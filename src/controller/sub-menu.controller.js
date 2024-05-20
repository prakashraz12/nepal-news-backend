import { SubMenu } from "../models/subMenu.model.js";
import { errorHandler } from "../utils/error-handler.util.js";
import { responseHandler } from "../utils/response-handler.util.js";

export const createSubMenu = async (req, res) => {
    const { subMenuTitle, subMenuOrder, menu, status } = req.body;
    try {
        if (!subMenuTitle || !subMenuOrder || !menu || !status) {
            return errorHandler(
                400,
                "Sub Menu title, sub menu order and main menu is required",
                res
            );
        }

        const isAlreadyExist = await SubMenu.findOne({
            $or: [
                { subMenuTitle: subMenuTitle },
                { subMenuOrder: subMenuOrder },
            ],
        });

        if (isAlreadyExist) {
            return errorHandler(
                409,
                "Sub menu title or submenu order is already exist",
                res
            );
        }
        const newSubMenu = await SubMenu({
            subMenuOrder,
            subMenuTitle,
            menu,
            status,
        });

        await newSubMenu.save();
        responseHandler(201, "SubMenu created successFully", newSubMenu, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

//searech menus
export const getListOfSubMenus = async (req, res) => {
    try {
        const { page, rowsPerPage, subMenuTitle, status, menu } = req.body;

        const query = {};
        if (subMenuTitle) {
            query.menuTitle = { $regex: subMenuTitle, $options: "i" };
        }
        if (status) {
            query.status = status;
        }

        const totalMenus = await SubMenu.countDocuments();

        const skip = (page - 1) * rowsPerPage;
        const limit = parseInt(rowsPerPage);

        const subMenus = await SubMenu.find(query)
            .skip(skip)
            .limit(limit)
            .populate({
                path: "menu",
                select: "_id menuTitle",
            });

        const responseData = {
            subMenus,
            totalMenus,
        };

        return responseHandler(
            200,
            "sub Menu fetched successfully",
            responseData,
            res
        );
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

// get list of sub menus by main menu id;
export const getListOfSubMenusByMainMenuId = async (req, res) => {
    try {
        const { id } = req.params; // This id is main menu id;
        if (!id) {
            return errorHandler(404, "Main Menu should required", res);
        }

        const subMenus = await SubMenu.find({ menu: id });

        if (!subMenus) {
            return errorHandler(404, "Sub Menus not found", res);
        }

        responseHandler(
            200,
            "Submenu list fetched successfully",
            subMenus,
            res
        );
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};
