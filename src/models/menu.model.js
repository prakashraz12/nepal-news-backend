import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
    {
        menuTitle: {
            type: String,
            required: true,
        },
        menuOrder: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
        layout: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: "Layout",
        },
        isShownOnNavbar: {
            type: Boolean,
            default:true
        },
    },
    { timestamps: true }
);

export const Menu = new mongoose.model("Menu", menuSchema);
