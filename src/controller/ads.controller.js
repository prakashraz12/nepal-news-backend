import { Ads } from "../models/ads.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { errorHandler } from "../utils/error-handler.util.js";
import { responseHandler } from "../utils/response-handler.util.js";

export const createAds = async (req, res) => {

    try {

        const { adsPosition, adsUrl } = req.body;


        if (!adsPosition || !adsUrl) {
            return errorHandler(400, "ads position, ads url and adsImage is required", res);
        }

        const isAlreadyexist = await Ads.findOne({ adsPosition });
        if (isAlreadyexist) {
            return errorHandler(409, "ads already exist", res)
        }

        let ads_ImageUrl = '';

        if (req?.file) {
            const ads_Image = req.file?.path;
            const cloudinaryUpload = await uploadOnCloudinary(ads_Image);
            ads_ImageUrl = cloudinaryUpload?.secure_url;
        }



        const adsCreate = new Ads({
            adsPosition,
            adsUrl,
            adsImage: ads_ImageUrl
        })

        await adsCreate.save();

        responseHandler(201, "ads created successfully", adsCreate, res)

    } catch (error) {
        errorHandler(500, error.message, res)
    }
}

export const getAdsByPosition = async (req, res) => {
    try {
        const { position } = req.params;
        if (!position) {
            return errorHandler(404, "position is required", res)
        }

        const findAds = await Ads.findOne({ adsPosition: position });

        if (!findAds) {
            return errorHandler(404, "ads not found", res)
        }

        responseHandler(200, "ads fetched successfully", findAds, res)
    } catch (error) {
        errorHandler(500, error.message, res)

    }
}