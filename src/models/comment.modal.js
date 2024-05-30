import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        comment: {
            type: String,
            required: true,
        },
        owner: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        news: {
            type: mongoose.Types.ObjectId,
            ref: "News",
        },
        likes: [
            {
                type: mongoose.Types.ObjectId,
                ref: "User",
            },
        ],
        disLikes: [
            {
                type: mongoose.Types.ObjectId,
                ref: "User",
            },
        ],
        replies: [
            {
                comment: { type: String, required: true, default: "" },
                owner: {
                    type: mongoose.Types.ObjectId,
                    ref: "User",
                },
            },
        ],
    },
    { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);
