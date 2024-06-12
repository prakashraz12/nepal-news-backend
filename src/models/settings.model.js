import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
    {
        isShowPopupAdsOnLandingPage: {
            type: Boolean,
            default: true,
        },
        isShowPopupAdsOnDetailsPage: {
            type: Boolean,
            default: true,
        },
        logoUrl: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

export const Settings = new mongoose.model("Settings", settingsSchema);
