import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
    {
        newsTitle: {
            type: String,
            required: true,
        },
        shortDescription: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        isPublished: {
            type: String,
            required: true,
        },
        tags: [
            {
                type: String,
            },
        ],
        recommendedNews: [
            {
                type: mongoose.Types.ObjectId,
                ref: "News",
            },
        ],
        owner: {
            type: mongoose.Types.ObjectId,
            ref: "Reporter",
        },
        isHighlighted: {
            type: Boolean,
            default: false,
        },
        bannerImage: {
            type: String,
        },
        comments: [
            {
                type: mongoose.Types.ObjectId,
                ref: "Comment",
            },
        ],
    },
    { timestamps: true }
);

export const News = new mongoose.model("News", newsSchema);
