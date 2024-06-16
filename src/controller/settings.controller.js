import { Layout } from "../models/layout.model.js";
import { Menu } from "../models/menu.model.js";
import { Settings } from "../models/settings.model.js";
import { SubMenu } from "../models/subMenu.model.js";
import { errorHandler } from "../utils/error-handler.util.js";
import { responseHandler } from "../utils/response-handler.util.js";

export const getSettings = async (req, res) => {
    try {
        const menus = await Menu.find({ status: "active" });
        const subMenus = await SubMenu.find({ status: "active" });
        const layout = await Layout.find();
        const defaultSettings = await Settings.find().sort({ createdAt: -1 });
        const settings = {
            menus,
            subMenus,
            layout,
            defaultSettings,
        };
        responseHandler(200, "settings fetched successfully", settings, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const createSettings = async (req, res) => {
    try {
        const {
            isShowPopupAdsOnLandingPage,
            isShowPopupAdsOnDetailsPage,
            logoUrl,
        } = req.body;
        const settings = await new Settings({
            isShowPopupAdsOnDetailsPage,
            isShowPopupAdsOnLandingPage,
            logoUrl,
        });
        await settings.save();
        const response = {};
        responseHandler(201, "settings addes success fully", response, res);
    } catch (error) {
        errorHandler(500, error?.message, res);
    }
};

export const updatePopUpAds = async (req, res) => {
    console.log(req.body);
    try {
        const {
            isShowPopupAdsOnLandingPage,
            isShowPopupAdsOnDetailsPage,
            settingsId,
        } = req.body;

        if (!settingsId) {
            return errorHandler(404, "settingsid is required", res);
        }

        const settings = await Settings.findById(settingsId);

        if (!settings) {
            return errorHandler(404, "settings not found", res);
        }

        settings.isShowPopupAdsOnDetailsPage = isShowPopupAdsOnDetailsPage;
        settings.isShowPopupAdsOnLandingPage = isShowPopupAdsOnLandingPage;
        await settings.save();
        responseHandler(200, "settings updates", settings, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};
