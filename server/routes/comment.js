import express from "express";
import Comment from "../models/comment.js";

const commentRouter = express.Router();

commentRouter.get("/bounty/:bountyId", async (req, res, next) => {
    try {
        const comments = await Comment.findAll({
            where: {
                bountyId: req.params.bountyId
            }
        });
        if (comments.length > 0) {
            return res.status(200).json(comments);
        } else {
            return res.status(404).json({ message: "No comments found for this bounty" });
        }
    } catch (err) {
        next(err);
    }
});

commentRouter.post("/bounty/:bountyId/user/:userId", async (req, res, next) => {
    try {
        if (!req.body.text) {
            return res.status(400).json({ message: "Comment text is missing" });
        }

        const newComment = await Comment.create({
            text: req.body.text,        
            bountyId: req.params.bountyId,
            userId: req.params.userId     
        });

        return res.status(201).json(newComment);
    } catch (err) {
        next(err);
    }
});

export default commentRouter;
