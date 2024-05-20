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
            type: Boolean,
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
            ref: "User",
        },
        isHighlighted: {
            type: Boolean,
            default: false,
        },
        bannerImage: {
            type: String,
        },
        province: {
            type: Number,
            default: 0,
        },
        isShowNewsOnProvince: {
            type: Boolean,
            default: false,
        },
        isDraft: {
            type: Boolean,
            default: false,
        },
        views: {
            type: String,
            default:0
        },
        comments: [
            {
                type: mongoose.Types.ObjectId,
                ref: "Comment",
            },
        ],
        menu: {
            type: mongoose.Types.ObjectId,
            ref: "Menu",
            required:true
        },
        subMenu: {
            type: mongoose.Types.ObjectId,
            ref:"Submenu"
        }
    },
    { timestamps: true }
);

export const News = new mongoose.model("News", newsSchema);
