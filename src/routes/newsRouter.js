import express from 'express';
import { createNews, getAllNews, analyzeNews } from '../controllers/newsController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/multer.middleware.js';
const router = express.Router();


router.get('/', getAllNews);
router.post('/', verifyJWT, upload.array('images', 5), createNews);
router.get('/:id/analyze', analyzeNews);

export default router;
