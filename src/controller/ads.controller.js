import { Ads } from "../models/ads.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { errorHandler } from "../utils/error-handler.util.js";
import { responseHandler } from "../utils/response-handler.util.js";

export const createAds = async (req, res) => {
    try {
        const { adsPosition, adsUrl } = req.body;
        if (!adsPosition || !adsUrl) {
            return errorHandler(
                400,
                "ads position, ads url and adsImage is required",
                res
            );
        }

        const isAlreadyexist = await Ads.findOne({ adsPosition });
        if (isAlreadyexist) {
            return errorHandler(409, "ads already exist", res);
        }

        let ads_ImageUrl = "";

        if (req?.file) {
            const ads_Image = req.file?.path;
            const cloudinaryUpload = await uploadOnCloudinary(ads_Image);
            ads_ImageUrl = cloudinaryUpload?.secure_url;
        }
        const adsCreate = new Ads({
            adsPosition,
            adsUrl,
            adsImage: ads_ImageUrl,
        });

        await adsCreate.save();

        responseHandler(201, "ads created successfully", adsCreate, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const getAllAds = async (req, res) => {
    try {
        // Fetch paginated ads
        const ads = await Ads.find();

        // Count total number of ads
        const totalAds = await Ads.countDocuments();

        responseHandler(
            200,
            "Ads fetched successfully",
            {
                ads,
            },
            res
        );
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const getAdsByPosition = async (req, res) => {
    try {
        const { position } = req.params;
        if (!position) {
            return errorHandler(404, "position is required", res);
        }

        const findAds = await Ads.findOne({ adsPosition: position });

        if (!findAds) {
            return errorHandler(404, "ads not found", res);
        }

        responseHandler(200, "ads fetched successfully", findAds, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const clickedCountOnAds = async (req, res) => {
    try {
        const { id } = req.params;
        const findAds = await Ads.findByIdAndUpdate(
            id,
            { $inc: { adsClickedCount: 1 } },
            { new: true }
        );
        if (!findAds) {
            errorHandler(404, "ads not found", res);
        }
        const response = {};
        responseHandler(
            200,
            "Clicked count updated successfully",
            response,
            res
        );
    } catch (error) {
        errorHandler(500, error?.message, res);
    }
};

export const updateAds = async (req, res) => {
    try {
        const { adsId, adsUrl, adsImage, adsPosition } = req.body;

        if (!adsId) {
            return errorHandler(400, "Ads ID required", res);
        }

        const existingAds = await Ads.findById(adsId);
        if (!existingAds) {
            return errorHandler(404, "Ads not found", res);
        }
        existingAds.adsPosition = adsPosition;
        if (adsUrl) {
            existingAds.adsUrl = adsUrl;
        }
        if (req.file) {
            const adsImage = req.file.path;
            const cloudinaryUpload = await uploadOnCloudinary(adsImage);
            existingAds.adsImage = cloudinaryUpload.secure_url;
        }
        if (adsImage) {
            existingAds.adsImage = adsImage;
        }

        await existingAds.save();

        responseHandler(200, "Ads updated successfully", existingAds, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const deleteAds = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return errorHandler(404, "id is required", res);
        }
        const findAds = await Ads.findByIdAndDelete(id);
        if (!findAds) {
            return responseHandler(404, "ads is not found", res);
        }
        const response = {};
        responseHandler(200, "ads deleted", response, res);
    } catch (error) {
        errorHandler(500, error?.message, res);
    }
};
