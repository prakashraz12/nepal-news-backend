import mongoose from "mongoose";

const subMenu = mongoose.Schema(
    {
        subMenuTitle: {
            type: String,
            required: true,
        },
        subMenuOrder: {
            type: Number,
            required: true,
        },
        menu: {
            type: mongoose.Types.ObjectId,
            ref: "Menu",
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export const SubMenu = new mongoose.model("SubMenu", subMenu);
