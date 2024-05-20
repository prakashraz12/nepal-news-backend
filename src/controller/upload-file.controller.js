import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { errorHandler } from "../utils/error-handler.util.js";
import { responseHandler } from "../utils/response-handler.util.js";

export const fileUpload = async (req, res) => {
    try {
        if (!req.file) {
            return errorHandler(400, "No file found", res);
        }
        const cloudinatyResponse = await uploadOnCloudinary(req.file.path);
        const resposeObject = {
            public_id: cloudinatyResponse?.public_id,
            secure_url: cloudinatyResponse?.secure_url,
        };
        return responseHandler(200, "Upload successfully", resposeObject, res);
    } catch (error) {
        console.log("error", error)
        errorHandler(500, error?.message, res);
    }
};
