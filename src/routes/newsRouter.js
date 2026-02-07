import express from 'express';
import { createNews, getAllNews, analyzeNews } from '../controllers/newsController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';
const router = express.Router();


router.get('/', getAllNews);
router.post('/',verifyJWT, createNews); 
router.get('/:id/analyze', analyzeNews);

export default router;
