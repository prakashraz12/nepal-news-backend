import { CoverStory } from "../models/cover-story.model.js";
import { Gallery } from "../models/gallery.model.js";
import { Menu } from "../models/menu.model.js";
import { News } from "../models/news.model.js";
import { SubMenu } from "../models/subMenu.model.js";
import { User } from "../models/user.model.js";
import { errorHandler } from "../utils/error-handler.util.js";
import { responseHandler } from "../utils/response-handler.util.js";
export const dashboard = async (req, res) => {
    try {
        const totalMenu = await Menu.countDocuments();
        const totalNews = await News.countDocuments();
        const totalCoverStory = await CoverStory.countDocuments();
        const totalGallery = await Gallery.countDocuments();
        const totalSubMenu = await SubMenu.countDocuments();
        const totalUsers = await User.countDocuments({ userType: "user" });
        const recentNews = await News.find().sort({ createdAt: -1 }).limit(10);

        // Calculate the start and end date for the last 7 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        const menus = await Menu.find();

        // Array to store promises for fetching news counts for each menu
        const promises = menus.map(async (menu) => {
            // Find news documents for the current menu
            const newsCount = await News.countDocuments({ menu: menu._id });
            // Return an object with menu name and news count
            return { menuName: menu.menuTitle, newsCount };
        });

        // Wait for all promises to resolve
        const counts = await Promise.all(promises);
        const menuCountDataStc = counts.reduce((result, item) => {
            // Calculate percentage
            const percentage = (item.newsCount / totalNews) * 100;
            // Assign menu name as key and percentage as value
            result[item.menuName] = percentage;
            return result;
        }, {});
        // Define the days of the week
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        // Query for documents (news, cover stories, and gallery entries) within the last 7 days
        const [weeklyNews, weeklyCoverStories, weeklyGallery] =
            await Promise.all([
                News.find({ createdAt: { $gte: startDate, $lte: endDate } }),
                CoverStory.find({
                    createdAt: { $gte: startDate, $lte: endDate },
                }),
                Gallery.find({ createdAt: { $gte: startDate, $lte: endDate } }),
            ]);

        // Initialize weekly data array with objects for each day of the week
        const weeklyData = daysOfWeek.map((day, index) => ({
            week: day,
            newsCount: 0,
            coverStoryCount: 0,
            galleryCount: 0,
        }));

        // Populate counts for each day of the week
        weeklyNews.forEach((news) => {
            const dayOfWeek = new Date(news.createdAt).getDay();
            weeklyData[dayOfWeek].newsCount++;
        });

        weeklyCoverStories.forEach((coverStory) => {
            const dayOfWeek = new Date(coverStory.createdAt).getDay();
            weeklyData[dayOfWeek].coverStoryCount++;
        });

        weeklyGallery.forEach((gallery) => {
            const dayOfWeek = new Date(gallery.createdAt).getDay();
            weeklyData[dayOfWeek].galleryCount++;
        });

        const response = {
            totalMenu,
            totalNews,
            totalCoverStory,
            totalGallery,
            totalSubMenu,
            totalUsers,
            recentNews,
            weeklyData,
            weeklyDataCount: { startDate, endDate },
            menuCountDataStc,
        };

        responseHandler(200, "dashboard", response, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};
