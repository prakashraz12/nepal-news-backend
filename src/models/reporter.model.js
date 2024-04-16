import mongoose from "mongoose";

const reporterSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            default: "",
        },
        phone: {
            type: Number,
        },
        avatar: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            default: "",
        },
        userType: {
            type: String,
            default: "reporter",
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        resetToken: String,
        resetTokenExpires: Date,
        verificationToken: String,
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export const Reporter = new mongoose.model("reporter", reporterSchema);
