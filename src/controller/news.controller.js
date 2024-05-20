import { News } from "../models/news.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { errorHandler } from "../utils/error-handler.util.js";
import { responseHandler } from "../utils/response-handler.util.js";

export const createNews = async (req, res) => {
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

        const newNews = new News({
            newsTitle,
            shortDescription,
            content,
            isPublished,
            tags,
            recommendedNews,
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

// Controller function to get all news articles
export const getAllNews = async (req, res) => {
    console.log("iassd");
    try {
        let { page, rowsPerPage, search } = req.body;
        page = parseInt(page) || 1;
        const limit = parseInt(rowsPerPage) || 10;

        const query = {};
        if (search) {
            query.newsTitle = { $regex: search, $options: "i" };
        }

        const count = await News.countDocuments();
        const totalPages = Math.ceil(count / limit);

        const allNews = await News.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("owner", "avatar fullName");

        res.status(200).json({
            data: allNews,
            totalPages,
            currentPage: page,
            totalLength: count,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controller function to get a specific news article by ID
export const getNewsById = async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) {
            return res.status(404).json({ message: "News not found" });
        }
        res.status(200).json(news);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controller function to update a news article by ID
export const updateNewsById = async (req, res) => {
    try {
        const updatedNews = await News.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedNews) {
            return res.status(404).json({ message: "News not found" });
        }
        res.status(200).json(updatedNews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controller function to delete a news article by ID
export const deleteNewsById = async (req, res) => {
    try {
        const deletedNews = await News.findByIdAndDelete(req.params.id);
        if (!deletedNews) {
            return res.status(404).json({ message: "News not found" });
        }
        res.status(200).json({ message: "News deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
