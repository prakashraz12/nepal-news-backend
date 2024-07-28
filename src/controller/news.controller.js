import { CoverStory } from "../models/cover-story.model.js";
import { Gallery } from "../models/gallery.model.js";
import { News } from "../models/news.model.js";
import { Story } from "../models/storyNews.model.js";
import { SubMenu } from "../models/subMenu.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { errorHandler } from "../utils/error-handler.util.js";
import { responseHandler } from "../utils/response-handler.util.js";
import slugify from "slugify";
import { slugGenerator } from "../utils/slug-generator.utils.js";
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
            province,
            isShowNewsOnProvince,
            slug,
        } = req.body;

        const slugifed_string = slugify(slug, {
            remove: undefined,
            lower: true, // convert to lower case, defaults to `false`
            strict: false, // strip special characters except replacement, defaults to `false`
            locale: "vi", // language code of the locale to use
            trim: true,
        });
        if (req?.file) {
            const bannerImage = req.file?.path;
            const cloudinaryUpload = await uploadOnCloudinary(bannerImage);
            bannerImage_url = cloudinaryUpload?.secure_url;
        }
        const orginalValue = JSON?.parse(recommendedNews);
        const newNews = new News({
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
            province,
            isShowNewsOnProvince,
            slug:slugifed_string
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
    try {
        let {
            page,
            rowsPerPage,
            newsTitle,
            isPublished,
            isDraft,
            isHighlighted,
            owner,
            province,
            startDate,
            endDate,
            menu,
            sort,
            isShowNewsOnProvince,
            subMenu,
        } = req.body;

        page = parseInt(page) || 1;
        const limit = parseInt(rowsPerPage) || 10;

        const query = {};
        if (menu?.length !== 0 && menu !== undefined) {
            query.menu = menu;
        }
        if (subMenu?.length !== 0 && subMenu !== undefined) {
            query.subMenu = subMenu;
        }

        if (newsTitle && newsTitle?.length !== 0) {
            query.newsTitle = { $regex: newsTitle, $options: "i" };
        }
        if (isPublished !== undefined) {
            query.isPublished = isPublished;
        }
        if (isHighlighted !== undefined) {
            query.isHighlighted = isHighlighted;
        }

        if (isDraft !== undefined) {
            query.isDraft = isDraft;
        }

        if (owner !== undefined && owner !== null) {
            query.owner = owner;
        }

        if (province !== undefined && province.length !== 0) {
            query.province = province;
        }

        if (isShowNewsOnProvince !== undefined) {
            query.isShowNewsOnProvince = isShowNewsOnProvince;
        }
        // Add date range query
        if (startDate && endDate) {
            // Convert to ISO format
            const startTime = new Date(startDate).setHours(0, 0, 0, 0); // Start time is 00:00:00
            const endTime = new Date(endDate).setHours(23, 59, 59, 999); // End time is 23:59:59
            query.createdAt = { $gte: startTime, $lte: endTime };
        }

        const count = await News.countDocuments(query);
        const totalPages = Math.ceil(count / limit);

        const allNews = await News.find(query)
            .select("newsTitle shortDescription createdAt bannerImage menu subMenu isPublished isHighlighted isShowNewsOnProvince isDraft")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: sort && sort === "asc" ? 1 : -1 })
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
        const news = await News.findById(req.params.id)
            .populate("owner", "fullName avatar email")
            .populate(
                "recommendedNews",
                "newsTitle bannerImage shortDescription createdAt"
            );
        if (!news) {
            return res.status(404).json({ message: "News not found" });
        }

        // Increment the views count by 1
        news.views = (parseInt(news.views, 10) + 1).toString();

        // Save the updated news object
        await news.save();

        responseHandler(200, "News fetched", news, res);
    } catch (error) {
        errorHandler(500, error?.message, res);
    }
};

export const updateNews = async (req, res) => {
    const {
        newsId,
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
        province,
        isShowNewsOnProvince,
        bannerImage,
    } = req.body;

    try {
        const user = req.user;
        let bannerImage_url = "";

        if (!newsId) {
            return errorHandler(404, "id is required", res);
        }

        const findNews = await News.findById(newsId);

        if (!findNews) {
            return errorHandler(404, "News not found", res);
        }

        const isAuth = findNews.owner.toString() === user.toString();
        if (!isAuth) {
            return errorHandler(403, "Not authorized", res);
        }

        if (req.file) {
            const bannerImagePath = req.file.path;
            const cloudinaryUpload = await uploadOnCloudinary(bannerImagePath);
            bannerImage_url = cloudinaryUpload?.secure_url;
        } else {
            bannerImage_url = bannerImage;
        }

        const orginalValue = JSON?.parse(recommendedNews);
        const orginalTags = JSON?.parse(tags);
        const updateFields = {
            newsTitle,
            shortDescription,
            content,
            isPublished,
            tags: orginalTags,
            recommendedNews: orginalValue,
            isHighlighted,
            isDraft,
            menu,
            subMenu,
            province,
            isShowNewsOnProvince,
            bannerImage: bannerImage_url,
        };

        const updatedNews = await News.findByIdAndUpdate(newsId, updateFields, {
            new: true,
        });

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

// controller function to get news by menu
export const getNewsByMenu = async (req, res) => {
    try {
        const { menu } = req.body;

        if (!menu || menu.length === 0) {
            return res
                .status(400)
                .json({ message: "Menu parameter is required" });
        }

        const allNews = {};

        for (const menuCategory of menu) {
            const query = { menu: menuCategory };
            const newsItems = await News.find(query)
                .sort({ createdAt: -1 })
                .limit(6)
                .populate("owner", "avatar fullName");

            allNews[menuCategory] = newsItems;
        }

        responseHandler(200, "news fetched", allNews, res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//
export const getTrendingNews = async (req, res) => {
    try {
        const { menuId, limit } = req.body;
        let query = {};
        if (menuId !== undefined) {
            query.menu = menuId;
        }

        const news = await News.find(query)
            .select("newsTitle views")
            .sort({ createdAt: -1, views: -1, "comments.length": -1 })
            .limit(limit || 10);

        responseHandler(200, "Trending news fetched", news, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const fetchNews = async (req, res) => {
    try {
        const { menuId } = req.params;

        const subMenus = await SubMenu.find({ menu: menuId });

        const newsPromises = subMenus.map(async (submenu) => {
            const news = await News.find({ subMenu: submenu._id })
                .sort({ createdAt: -1 })
                .populate("owner", "fullName avatar")
                .limit(5);
            return {
                submenu: submenu.subMenuTitle,
                news,
                subMenuId: submenu._id,
            };
        });

        const newsBySubmenu = await Promise.all(newsPromises);

        // Check if any submenu has news
        const hasNews = newsBySubmenu.some((item) => item.news.length > 0);

        if (!hasNews || !subMenus || subMenus.length === 0) {
            // If no news found for any submenu, fallback to searching news by menuId
            const fallbackNews = await News.find({ menu: menuId })
                .sort({ createdAt: -1 })
                .populate("owner", "fullName avatar")
                .limit(5);

            const responseData = {
                isSubMenuNull: true,
                data: fallbackNews,
            };
            return responseHandler(200, "News fetched", responseData, res);
        }

        const responseData = {
            isSubMenuNull: false,
            data: newsBySubmenu,
        };
        responseHandler(200, "News fetched", responseData, res);
    } catch (error) {
        console.error("Error fetching news:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getNewsBySubMenu = async (req, res) => {
    try {
        const { page, limit, subMenuId } = req.query;
        if (!subMenuId) {
            return errorHandler(
                400,
                "Page, limit, submenu id is required",
                res
            );
        }
        // Convert page and limit to integers
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        // Calculate skip value based on page number and limit
        const skip = (pageNumber - 1) * limitNumber;

        const newsItems = await News.find({ subMenu: subMenuId })
            .populate("owner", "fullName avatar")
            .skip(skip)
            .limit(limitNumber)
            .exec();

        responseHandler(200, "News fetched successfully", newsItems, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const moreCommentedNews = async (req, res) => {
    try {
        const findNews = await News.find()
            .sort({
                createdAt: -1,
                "comments.length": -1,
            })
            .limit(10)
            .select("newsTitle")
            .populate("owner", "fullName");

        if (!findNews) {
            return errorHandler(400, "news not found", res);
        }
        responseHandler(200, "news fetched successfully", findNews, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const provinceNews = async (req, res) => {
    try {
        const provinces = [1, 2, 3, 4, 5, 6, 7];

        const provinceNews = {};

        for (const provinceNumber of provinces) {
            const news = await News.find({
                isShowNewsOnProvince: true,
                province: provinceNumber,
            })
                .limit(10)
                .populate("owner", "fullName avatar");
            provinceNews[`${provinceNumber}`] = news;
        }

        responseHandler(200, "province news fetched", provinceNews, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const shareCountIncreament = async (req, res) => {
    try {
        const { newsId, newsType } = req.body;
        if (!newsId || !newsType) {
            return errorHandler(400, "news id and newsType is undefined", res);
        }
        let news;

        if (newsType === "coverstory") {
            news = await CoverStory.findByIdAndUpdate(
                newsId,
                { $inc: { shares: 1 } },
                { new: true }
            );
        } else if (newsType === "gallery") {
            news = await Gallery.findByIdAndUpdate(
                newsId,
                { $inc: { shares: 1 } },
                { new: true }
            );
        } else if (newsType === "story") {
            news = await Story.findByIdAndUpdate(
                newsId,
                { $inc: { shares: 1 } },
                { new: true }
            );
        } else {
            news = await News.findByIdAndUpdate(
                newsId,
                { $inc: { shares: 1 } },
                { new: true }
            );
        }

        if (!news) {
            return errorHandler(404, "news not found", res);
        }

        responseHandler(200, "share count inc successfully", news, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const bulkNewsUpdate = async (req, res) => {
    try {
        const newsToUpdate = await News.find();

        console.log(`Found ${newsToUpdate.length} news to update.`);

        // Now update each news document with the actual slug
        for (let item of newsToUpdate) {
            const slug = slugGenerator(
                "Jhala Nath Khanal withdraws candidacy for party President, endorses Ghanashyam Bhusal"
            );

            console.log("s", slug);

            // item.slug = slug;
            // await item.save(); // Wait for the save operation to complete
        }

        res.status(200).json({ message: "o9k" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
