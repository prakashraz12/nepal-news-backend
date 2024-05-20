import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
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
            default: "user",
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

export const User = new mongoose.model("User", userSchema);
