import { News } from "../models/news.model";
import { errorHandler } from "../utils/error-handler.util";

//create news;
export const createNews = async (req, res) => {
    try {
        const userId = req.user;
        const { newsTitle, shortDesctiption, tags, content, bannerImage, recommendedNews, province,isPublished, isHighlighted } = req.body;
        
        if (!newsTitle || !shortDesctiption || !content || !province, !isPublished, !isHighlighted) {
            return errorHandler(400, "All fields are required", res);
        }

        const createNews = new News.create({
            newsTitle,
            shortDesctiption,
            tags,
            content,
            bannerImage,
            recommendedNews,
            province,
            isPublished,
            isHighlighted,
            owner:userId
        })

        await createNews.save();


    } catch (error) {
        
    }
}