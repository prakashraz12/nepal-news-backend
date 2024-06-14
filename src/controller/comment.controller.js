import { Comment } from "../models/comment.modal.js";
import { CoverStory } from "../models/cover-story.model.js";
import { Gallery } from "../models/gallery.model.js";
import { News } from "../models/news.model.js";
import { User } from "../models/user.model.js";
import { errorHandler } from "../utils/error-handler.util.js";
import { responseHandler } from "../utils/response-handler.util.js";

export const createComment = async (req, res) => {
    try {
        const user = req.user;
        const { newsId, comment, type } = req.body;
        if (!newsId || !comment) {
            return errorHandler(400, "news id and comment are required", res);
        }

        let news = null;
        if (type === "coverstory") {
            news = await CoverStory.findById(newsId);
        } else if (type === "gallery") {
            news = await Gallery.findById(newsId);
        } else {
            news = await News.findById(newsId);
        }
        const commentUser = await User.findById(user);
        if (!commentUser) {
            return errorHandler(404, "user not found", res);
        }
        if (!news) {
            return errorHandler(404, "News not found", res);
        }

        const commentData = new Comment({
            comment,
            owner: user,
            news: news?._id,
        });

        await commentData.save();
        news.comments.push(commentData?._id);
        await news.save();
        commentUser.comments.push(commentData?._id);
        await commentUser.save();
        await commentData.populate("owner");
        responseHandler(201, "comment successfull", commentData, res);
    } catch (error) {
        errorHandler(500, error.messsage, res);
    }
};

export const repliedComment = async (req, res) => {
    try {
        const { commentId, comment } = req.body;
        const user = req.user;
        if (!commentId) {
            return errorHandler(404, "CommentId required", res);
        }
        const findComment = await Comment.findById(commentId).populate(
            "owner",
            "fullName avatar"
        );

        if (!findComment) {
            return errorHandler(404, "Comment not found", res);
        }
        findComment.replies.push({ comment, owner: user });
        await findComment.save();

        const repliedComment = await Comment.findById(findComment._id).populate(
            "replies.owner",
            "fullName avatar"
        );

        responseHandler(
            201,
            "Comment replied successfully",
            repliedComment,
            res
        );
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const likeComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const user = req.user;
        if (!commentId) {
            return errorHandler(404, "Comment id is required", res);
        }
        const findComment = await Comment.findById(commentId);
        if (!findComment) {
            return errorHandler(500, "Comment not found", res);
        }

        const isAlreadyLiked = findComment.likes.some(
            (u) => u.toString() === user.toString()
        );
        const isAlreadyUnliked = findComment.disLikes.some(
            (u) => u.toString() === user.toString()
        );

        if (isAlreadyUnliked) {
            findComment.disLikes.pull(user);
            findComment.likes.push(user);
        } else if (isAlreadyLiked) {
            return errorHandler(500, "Already liked", res);
        } else {
            findComment.likes.push(user);
        }
        await findComment.save();
        responseHandler(200, "Comment liked successfully", findComment, res);
    } catch (error) {
        errorHandler(500, error.messsage, res);
    }
};

export const dislikeComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const user = req.user;

        if (!commentId) {
            return errorHandler(404, "Comment ID is required", res);
        }

        const findComment = await Comment.findById(commentId);

        if (!findComment) {
            return errorHandler(404, "Comment not found", res);
        }

        const isAlreadyLiked = findComment.likes.some(
            (u) => u.toString() === user.toString()
        );
        const isAlreadyDisliked = findComment.disLikes.some(
            (u) => u.toString() === user.toString()
        );

        if (isAlreadyLiked) {
            findComment.likes.pull(user);
            findComment.disLikes.push(user);
        } else if (isAlreadyDisliked) {
            return errorHandler(400, "Already disliked", res);
        } else {
            findComment.disLikes.push(user);
        }

        await findComment.save();

        responseHandler(200, "Comment disliked successfully", findComment, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const getAllComments = async (req, res) => {
    try {
        const { newsId } = req.params;
        if (!newsId) {
            return errorHandler(404, "News ID is required", res);
        }

        let { page, limit } = req.query;

        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;

        const skip = (page - 1) * limit;

        const comment = await Comment.find({ news: newsId })
            .populate("owner", "fullName avatar")
            .populate({
                path: "replies",
                populate: { path: "owner", select: "fullName avatar" },
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        responseHandler(200, "Comments fetched successfully", comment, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { commentId, type } = req.body;

        if (!commentId) {
            return errorHandler(404, "Comment id is required");
        }
        const user = req.user;

        const findComment = await Comment.findById(commentId);

        if (!findComment) {
            return errorHandler(404, "comment not found", res);
        }
        let findNews = null;

        if (type === "coverstory") {
            findNews = await CoverStory.findOne({ comments: findComment?._id });
        } else if (type === "gallery") {
            findNews = await Gallery.findOne({ comments: findComment?._id });
        } else {
            findNews = await News.findOne({ comments: findComment?._id });
        }

        if (!findNews) {
            return errorHandler(403, "news not found", res);
        }

        if (
            findComment.owner?.toString() !== user.toString() ||
            findNews.owner.toString() !== user.toString()
        ) {
            return errorHandler(403, "not authorised person", res);
        }

        const commentIdsToRemove = findComment?._id;

        findNews.comments = findNews.comments.filter(
            (commentId) =>
                commentId?.toString() !== commentIdsToRemove.toString()
        );
        await findNews.save();

        await findComment.deleteOne();

        const response = {};
        responseHandler(200, "comment deleted", response, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const deleteReplies = async (req, res) => {
    try {
        const { commentId, replyId, type } = req.body;
        const user = req.user;

        if (!user) {
            return errorHandler(500, "Please login buddie", res);
        }
        if (!commentId || !replyId) {
            return errorHandler(
                403,
                "comment id and reply id are required",
                res
            );
        }

        const comment = await Comment.findById(commentId);
        let findNews = null;
        
        if (type === "coverstory") {
            findNews = await CoverStory.findOne({ comments: commentId });
        } else if (type === "gallery") {
            findNews = await Gallery.findOne({ comments: commentId });
        } else {
            findNews = await News.findOne({ comments: commentId });
        }

        if (!findNews) {
            return errorHandler(403, "News not found", res);
        }

        if (!comment) {
            return errorHandler(404, "Comment not found", res);
        }

        const repliedOwner = comment.replies.find(
            (reply) => reply._id.toString() === replyId?.toString()
        );

        if (!repliedOwner) {
            return errorHandler(404, "replied owner not found!", res);
        }

        if (
            comment.owner?.toString() !== user.toString() ||
            findNews.owner.toString() !== user.toString() ||
            repliedOwner?.owner?.toString() !== user.toString()
        ) {
            return errorHandler(403, "Not authorized person", res);
        }

        comment.replies = comment.replies.filter(
            (reply) => reply._id.toString() !== replyId
        );
        await comment.save();

        responseHandler(200, "Replies deleted", {}, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const updateComment = async (req, res) => {
    try {
        const { commentId, comment } = req.body;
        if (!commentId || !comment) {
            return errorHandler(404, "comment id and comment is required");
        }

        const user = req.user;

        const findComment = await Comment.findById(commentId);
        if (!findComment) {
            return errorHandler(404, "comment is not found");
        }

        if (findComment.owner?.toString() !== user.toString()) {
            return errorHandler(403, "Not authorized person", res);
        }
        findComment.comment = comment;
        findComment.save();

        responseHandler(200, "udpate comment successfully", findComment, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const updateRepliesComment = async (req, res) => {
    try {
        const { commentId, replyId, comment } = req.body;

        const user = req.user;
        if (!commentId || !replyId) {
            return errorHandler(
                400,
                "comment id and reply id are required",
                res
            );
        }

        const _comment = await Comment.findById(commentId);

        if (!_comment) {
            return errorHandler(404, "Comment not found", res);
        }

        const repliedOwner = _comment.replies.find(
            (reply) => reply._id.toString() === replyId?.toString()
        );

        if (!repliedOwner) {
            return errorHandler(404, "replied owner not found!", res);
        }

        if (repliedOwner?.owner?.toString() !== user.toString()) {
            return errorHandler(403, "Not authorized person", res);
        }

        _comment.replies = _comment.replies.map((item) => {
            if (item._id.toString() === replyId.toString()) {
                return {
                    ...item,
                    comment: comment,
                };
            }
            return item;
        });

        await _comment.save();

        const updatedComment = await Comment.findById(commentId);

        if (!updatedComment) {
            return errorHandler(404, "Updated comment not found", res);
        }
        responseHandler(200, "Reply updated", updatedComment, res);
    } catch (error) {
        errorHandler(500, error.message, res);
    }
};

export const getCommentByOwnerId = async (req, res) => {
    try {

        const userId = req.user;
        if (!userId) {
            return errorHandler(404, "user not found", res);
        }
  

        const findComment = await Comment.find({ owner: userId }).populate("news", "newsTitle").sort({
            createdAt: -1,
        });
        
        if (!findComment) {
            errorHandler(404, "comment not found", res);
        }

        responseHandler(200, "comment fetched successFully", findComment, res);
    } catch (error) {
       errorHandler(500, error?.message, res)
    }
};