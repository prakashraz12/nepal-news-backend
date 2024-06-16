import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
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
            default:true
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
      
        bannerImage: {
            type: String,
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

export const Story = new mongoose.model("Story", storySchema);
