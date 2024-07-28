import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { errorHandler } from "../utils/error-handler.util.js";
import { responseHandler } from "../utils/response-handler.util.js";
import { transporter } from "../utils/nodemailer.js";
import { Reporter } from "../models/reporter.model.js";
import { User } from "../models/user.model.js";
import { Gallery } from "../models/gallery.model.js";
import { CoverStory } from "../models/cover-story.model.js";
import { Story } from "../models/storyNews.model.js";
import { News } from "../models/news.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";
// reportter create
export const createNewReporter = async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;
        // Check if all required fields are provided
        if (!fullName || !email || !password) {
            return errorHandler(
                400,
                "Please fill all required fields (e.g., email, password, fullname)",
                res
            );
        }
        // Check if user already exists in the database
        const existingUser = await User.findOne({ email: email });
        // If user already exists, return error
        if (existingUser) {
            return errorHandler(
                403,
                "User already exists in the database.",
                res
            );
        }

        // Hash the password before saving user in the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await Reporter.create({
            fullName,
            email,
            password: hashedPassword,
            phone,
        });

        //verification token;
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: "30m",
        });

        // Save verification token in the database
        newUser.verificationToken = verificationToken;
        await newUser.save();

        // Return success response
        return responseHandler(201, "User created successfully", newUser, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

//user login
export const loginReporter = async (req, res) => {
    try {
        const { email, password } = req.body;
        //find user
        const findUser = await User.findOne({ email });
        if (!findUser) {
            return errorHandler(404, "User not found", res);
        }

        const isUserReporter =
            findUser?.userType === "reporter" || findUser?.userType === "admin";
        if (!isUserReporter) {
            return errorHandler(403, "you are not authorized person", res);
        }
        //compare password;
        const isPasswordMatched = await bcrypt.compare(
            password,
            findUser.password
        );

        //if password is not matched
        if (!isPasswordMatched) {
            return errorHandler(400, "Invalid user details", res);
        }

        //create jwtToken;
        const token = jwt.sign(
            { userId: findUser?._id, role: findUser?.userType },
            process.env.JWT_SECRET,
            {
                expiresIn: "90d",
            }
        );

        //set cookies to client user;
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            maxAge: 90 * 24 * 60 * 60 * 1000,
        });

        //extract password and usertype and unneeded fields from resposne
        const formattedData = {
            fullName: findUser?.fullName,
            email: findUser?.email,
            phone: findUser?.phone,
            address: findUser?.address,
            avatar: findUser?.avatar,
        };
        const data = {
            token,
            user: formattedData,
            role: findUser?.userType,
        };

        return responseHandler(200, "User logedIn Successfully", data, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

//forgot password
export const reporterForgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        // Generate reset token
        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: "10m",
        });

        const user = await User.findOneAndUpdate(
            { email },
            { resetToken, resetTokenExpires: Date.now() + 600000 }
        );

        if (!user) {
            return errorHandler(404, "User not found", res);
        }
        // Send reset password email
        const resetURL = `http://localhost:5173/auth/reset-password-page/${resetToken}`;
        await transporter.sendMail({
            to: email,
            subject: "Reset Your Password",
            html: `Please click on this link to reset your password: <a href="${resetURL}">${resetURL}</a>`,
        });

        res.status(200).json({ message: "Reset password email sent" });
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const getReporters = async (req, res) => {
    const { page = 1, limit = 10, name } = req.body;
    try {
        const skip = (page - 1) * limit;

        let query = { userType: "reporter" };

        if (name) {
            query.fullName = { $regex: new RegExp(name, "i") };
        }

        const reporters = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        if (!reporters || reporters.length === 0) {
            return errorHandler(404, "Reporters not found", res);
        }

        responseHandler(200, "Reporters fetched", reporters, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const getReporterById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return errorHandler(400, "id is required", res);
        }

        const reporter = await User.findById(id).select(
            "fullName email phone bio isBlocked userType"
        );

        if (!reporter) {
            return errorHandler(404, "reporter not found", res);
        } else if (reporter.userType !== "reporter") {
            return errorHandler(404, "user is not reporter", res);
        }
        responseHandler(200, "reporetr fetched", reporter, res);
    } catch (error) {
        errorHandler(500, error?.message, res);
    }
};

export const updateReporter = async (req, res) => {
    const { fullName, email, phone, bio, userId, isBlocked } = req.body;
    try {
        const logedInUser = req.user;
        const role = req.role;

        const findUser = await User.findById(userId);

        if (!findUser) {
            return errorHandler(404, "user not found", res);
        }
        if (
            findUser?._id?.toString() === logedInUser?.toString() ||
            role !== "admin"
        ) {
            return errorHandler(403, "you are not authorised person", res);
        }

        if (req?.file) {
            const bannerImage = req.file?.path;
            const cloudinaryUpload = await uploadOnCloudinary(bannerImage);
            findUser.avatar = cloudinaryUpload?.secure_url;
        }

        findUser.fullName = fullName;
        findUser.email = email;
        findUser.phone = phone;
        findUser.bio = bio;
        findUser.isBlocked = isBlocked;

        await findUser.save();
        const response = {
            fullName: findUser.fullName,
            email: findUser.email,
            phone: findUser.phone,
            avatar: findUser?.avatar,
            bio: findUser?.bio,
        };
        responseHandler(200, "user's data udpated", response, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const getReporter = async (req, res) => {
    try {
        const user = req.user;
        const findReporter = await User.findById(user).select(
            "fullName email phone bio avatar"
        );
        if (!findReporter) {
            return errorHandler(404, "reporter not found", res);
        }
        responseHandler(200, "reporter data fetched", findReporter, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const searchReporterNews = async (req, res) => {
    try {
        let {
            page,
            rowsPerPage,
            newsTitle,
            isPublished,
            isDraft,
            isHighlighted,
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
        query.owner = req.user;
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

export const searchReporterGalleryNews = async (req, res) => {
    try {
        let {
            page,
            rowsPerPage,
            newsTitle,
            isPublished,
            isDraft,
            isHighlighted,
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
        query.owner = req.user;
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

        const count = await Gallery.countDocuments(query);
        const totalPages = Math.ceil(count / limit);

        const allNews = await Gallery.find(query)
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

export const getReporterCoverStoryNews = async (req, res) => {
    try {
        let {
            page,
            rowsPerPage,
            newsTitle,
            isPublished,
            isDraft,
            isHighlighted,
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
        query.owner = req.user;
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

        const count = await CoverStory.countDocuments(query);
        const totalPages = Math.ceil(count / limit);

        const allNews = await CoverStory.find(query)
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

export const getAllReporterStoryNews = async (req, res) => {
    try {
        let {
            page,
            rowsPerPage,
            newsTitle,
            isPublished,
            isDraft,
            isHighlighted,
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
        query.owner = req.user;
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

        const count = await Story.countDocuments(query);
        const totalPages = Math.ceil(count / limit);

        const allNews = await Story.find(query)
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

export const meReporterUpdate = async (req, res) => {
    try {
        const { fullName, email, phone, bio, avatar } = req.body;
        const user = req.user;
        const findUser = await User.findById(user);
        if (!findUser) {
            return errorHandler(404, "reporter not found", res);
        }
        if (req?.file) {
            const bannerImage = req.file?.path;
            const cloudinaryUpload = await uploadOnCloudinary(bannerImage);
            findUser.avatar = cloudinaryUpload?.secure_url;
        } else {
            findUser.avatar = avatar;
        }

        findUser.fullName = fullName;
        findUser.email = email;
        findUser.phone = phone;
        findUser.bio = bio;

        await findUser.save();
        const response = {
            fullName: findUser.fullName,
            email: findUser.email,
            phone: findUser.phone,
            avatar: findUser?.avatar,
            bio: findUser?.bio,
        };
        responseHandler(200, "user's data udpated", response, res);
    } catch (error) {
        errorHandler(500, error?.message, res);
    }
};
