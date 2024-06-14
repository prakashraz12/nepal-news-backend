import { CoverStory } from "../models/cover-story.model.js";
import { Story } from "../models/storyNews.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { errorHandler } from "../utils/error-handler.util.js";
import { responseHandler } from "../utils/response-handler.util.js";

export const createStoryNews = async (req, res) => {
    try {
        const logedInUser = req?.user;
        let bannerImage_url = "";
        const {
            newsTitle,
            shortDescription,
            content,
            isPublished,
            tags,
            recommendedNews,
            isDraft,
            menu,
            subMenu,
        } = req.body;

        if (req?.file) {
            const bannerImage = req.file?.path;
            const cloudinaryUpload = await uploadOnCloudinary(bannerImage);
            bannerImage_url = cloudinaryUpload?.secure_url;
        }
        const orginalValue = JSON?.parse(recommendedNews);
        const newNews = new Story({
            newsTitle,
            shortDescription,
            content,
            isPublished,
            tags,
            recommendedNews: orginalValue,
            owner: logedInUser,
            bannerImage: bannerImage_url,
            isDraft,
            menu,
            subMenu,
        });

        const savedNews = await newNews.save();
        return responseHandler(
            201,
            "Story News created successfully",
            savedNews,
            res
        );
    } catch (error) {
        errorHandler(500, error?.message, res);
    }
};

export const getAllStoryNews = async (req, res) => {
    try {
        const limit = 50;
        const storyNews = await Story.find()
            .select("bannerImage")
            .populate("owner", "fullName")
            .sort({ createdAt: -1 })
            .limit(limit || 50);

        if (!storyNews) {
            return errorHandler(404, "Cover story not found", res);
        }
        responseHandler(200, "Cover story fetched", storyNews, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const getStoryNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return errorHandler(400, "id is required", res);
        }

        const galleryNews = await Story.findById(id)
            .populate("owner", "fullName avatar")
            .populate(
                "recommendedNews",
                "newsTitle bannerImage shortDescription createdAt"
            );

        if (!galleryNews) {
            return errorHandler(500, "news not found", res);
        }
        responseHandler(200, "story news fetched", galleryNews, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};
