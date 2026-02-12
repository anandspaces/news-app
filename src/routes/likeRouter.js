import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    // toggleVideoLike,
    toggleNewsLike,
    togglePodcastLike,
} from "../controllers/likeController.js"
import { verifyJWT } from "../middlewares/authMiddleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/n/:newsId").post(toggleNewsLike);
router.route("/toggle/p/:podcastId").post(togglePodcastLike);
// router.route("/videos").get(getLikedVideos);

export default router;
