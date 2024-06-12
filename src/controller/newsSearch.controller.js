import { CoverStory } from "../models/cover-story.model.js";
import { Gallery } from "../models/gallery.model.js";
import { News } from "../models/news.model.js";
import { Story } from "../models/storyNews.model.js";
import { errorHandler } from "../utils/error-handler.util.js";
import { responseHandler } from "../utils/response-handler.util.js";

export const searchController = async (req, res) => {
    try {
        const { searchParams, page, pageSize = 10 } = req.body;
        if (!searchParams) {
            return res
                .status(400)
                .json({ message: "Search parameter is required." });
        }

        const skip = (page - 1) * pageSize;
        const NewsResults = await News.find({
            newsTitle: { $regex: new RegExp(searchParams, "i") },
        })
            .skip(skip)
            .limit(pageSize);
        const GalleryNews = await Gallery.find({
            newsTitle: { $regex: new RegExp(searchParams, "i") },
        })
            .skip(skip)
            .limit(pageSize);
        const CoverStoryNews = await CoverStory.find({
            newsTitle: { $regex: new RegExp(searchParams, "i") },
        })
            .skip(skip)
            .limit(pageSize);
        const StoryNews = await Story.find({
            newsTitle: { $regex: new RegExp(searchParams, "i") },
        })
            .skip(skip)
            .limit(pageSize);
            const totalLength = NewsResults.length + GalleryNews.length + CoverStoryNews.length + StoryNews.length;

        const response = {
            NewsResults,
            GalleryNews,
            CoverStoryNews,
            StoryNews,
            length:totalLength
        };

        responseHandler(200, "search results", response, res);
    } catch (error) {
        errorHandler(500, error?.message, res);
    }
};
