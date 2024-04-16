import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

//cloudinary config;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

//file uplopad handler;
export const uploadOnCloudinary = async (localFilePath) => {
    console.log("localpath", localFilePath)
    try {
        if (!localFilePath) {
            return null;
        }
        //upload the file on cloudinary
        const cloudinaryResponse = cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        //file has been uoload successfully
        console.log("file uploaded", cloudinaryResponse);
    } catch (error) {
        //remove unwanted || temp  files from server
        fs.unlinkSync(localFilePath);
        return null;
    }
};


