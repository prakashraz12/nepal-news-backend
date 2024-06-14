import { CoverStory } from "../models/cover-story.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { errorHandler } from "../utils/error-handler.util.js";
import { responseHandler } from "../utils/response-handler.util.js";

export const createCoverStory = async (req, res) => {
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
            isHighlighted,
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
        const newNews = new CoverStory({
            newsTitle,
            shortDescription,
            content,
            isPublished,
            tags,
            recommendedNews: orginalValue,
            owner: logedInUser,
            isHighlighted,
            bannerImage: bannerImage_url,
            isDraft,
            menu,
            subMenu,
        });

        const savedNews = await newNews.save();
        return responseHandler(
            201,
            "News created successfully",
            savedNews,
            res
        );
    } catch (error) {
        errorHandler(500, error?.message, res);
    }
};

export const getAllCoverNews = async (req, res) => {
    try {
        const { page, limit, menu, newsTitle, isPublished } = req.body;

        const skip = (page - 1) * limit;
        const query = {};
        if (menu?.length !== 0 && menu !== undefined) {
            query.menu = menu;
        }

        if (newsTitle && newsTitle?.length !== 0) {
            query.newsTitle = { $regex: newsTitle, $options: "i" };
        }
        if (isPublished !== undefined) {
            query.isPublished = isPublished;
        }

        const storyNews = await CoverStory.find(query).select("newsTitle shortDescription createdAt bannerImage").populate("owner", "fullName avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit || 10);

        if (!storyNews) {
            return errorHandler(404, "Cover story not found", res);
        }
        responseHandler(200, "Cover story fetched", storyNews, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};


export const getCoverStoryNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return errorHandler(400, "id is required", res);
        }

        const galleryNews = await CoverStory.findById(id)
            .populate("owner", "fullName avatar")
            .populate(
                "recommendedNews",
                "newsTitle bannerImage shortDescription createdAt"
            );

        if (!galleryNews) {
            return errorHandler(500, "news not found", res);
        }
        responseHandler(200, "cover news fetched", galleryNews, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};
