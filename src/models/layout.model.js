import mongoose from "mongoose";

const layoutSchema = new mongoose.Schema(
    {
        layoutTitle: {
            type: String,
            required: true,
            unique:true
        },
        status: {
            type: Boolean,
            required: true,
            default:true
        },
    },
    { timestamps: true }
);

export const Layout = new mongoose.model("Layout", layoutSchema);
