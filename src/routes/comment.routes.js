import { Router } from "express";
import {
    createComment,
    deleteComment,
    deleteReplies,
    dislikeComment,
    getAllComments,
    likeComment,
    repliedComment,
    updateComment,
    updateRepliesComment,
} from "../controller/comment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

//routes to create comment
router.post("/create", verifyJWT, createComment);

// routes to create comment;
router.post("/replies", verifyJWT, repliedComment);

// routes to like comment ;
router.get("/:commentId", verifyJWT, likeComment);

// routes to dislike comment ;
router.get("/dislike/:commentId", verifyJWT, dislikeComment);
// routes to get all comment;
router.get("/get/:newsId", getAllComments);

// routes to delete comment;
router.post("/delete", verifyJWT, deleteComment);

// delete replies;
router.post("/delete/replies", verifyJWT, deleteReplies);

//update comment;
router.post("/update", verifyJWT, updateComment);

// routes to update comment replies;
router.post("/update/reply", verifyJWT, updateRepliesComment);

export default router;
