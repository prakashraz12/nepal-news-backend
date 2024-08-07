import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
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
        slug: {
            type: String,
            required: true,
            unique:true
        },
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

        isDraft: {
            type: Boolean,
            default: false,
        },
        views: {
            type: Number,
            default: 0,
        },
        shares: {
            type: Number,
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
            required: true,
        },
        subMenu: {
            type: mongoose.Types.ObjectId,
            ref: "Submenu",
        },
    },
    { timestamps: true }
);

export const Gallery = new mongoose.model("Gallery", gallerySchema);
