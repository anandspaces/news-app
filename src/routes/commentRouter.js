import { Router } from 'express';
import {
    addComment,
    deleteComment,
    // getVideoComments,
    getNewsComments,
    getPodcastComments,
    updateComment
} from "../controllers/commentController.js"
import { verifyJWT } from "../middlewares/authMiddleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// router.route("/video/:videoId").get(getVideoComments).post(addComment);
router.route("/news/:newsId").get(getNewsComments).post(addComment);
router.route("/podcast/:podcastId").get(getPodcastComments).post(addComment);

router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router;
