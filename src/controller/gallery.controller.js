import { CoverStory } from "../models/cover-story.model.js";
import { Gallery } from "../models/gallery.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { errorHandler } from "../utils/error-handler.util.js";
import { responseHandler } from "../utils/response-handler.util.js";
import slugify from "slugify";
export const createGalleryNews = async (req, res) => {
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
            slug
        } = req.body;

        if (req?.file) {
            const bannerImage = req.file?.path;
            const cloudinaryUpload = await uploadOnCloudinary(bannerImage);
            bannerImage_url = cloudinaryUpload?.secure_url;
        }
        const slug_string = slugify(slug, {
            lower: false,
            strict: false,
            locale: "vi",
            trim: true,
        });
        const orginalValue = JSON?.parse(recommendedNews);
        const newNews = new Gallery({
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
            slug: slug_string,
        });

        const savedNews = await newNews.save();
        return responseHandler(
            201,
            "Gallery news created successfully",
            savedNews,
            res
        );
    } catch (error) {
        errorHandler(500, error?.message, res);
    }
};

export const getAllGalleryNews = async (req, res) => {
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

        const galleryNews = await Gallery.find(query)
            .select("newsTitle shortDescription createdAt bannerImage menu subMenu isPublished isDraft").populate("owner")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit || 10);

        const count = await Gallery.countDocuments();
        const totalPages = Math.ceil(count / limit || 10);
        if (!galleryNews) {
            return errorHandler(404, "Gallery news found", res);
        }

        const response = {
            data: galleryNews,
            totalPages,
            count,
        };
        responseHandler(200, "Gallery news found", response, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const getGalleryNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return errorHandler(400, "id is required", res);
        }

        const galleryNews = await Gallery.findById(id)
            .populate("owner", "fullName avatar")
            .populate(
                "recommendedNews",
                "newsTitle bannerImage shortDescription createdAt"
            );

        if (!galleryNews) {
            return errorHandler(500, "news not found", res);
        }
        responseHandler(200, "gallery news fetched", galleryNews, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};
