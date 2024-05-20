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
    },
    { timestamps: true }
);

export const Menu = new mongoose.model("Menu", menuSchema);
