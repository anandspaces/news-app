import News from "../models/newsModel.js";
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import logger from "../utils/logger.js";


const getAllNews = asyncHandler(async (req, res) => {
    const news = await News.find();
    if (!news) {
        throw new ApiError(404, "No news found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, news, "News fetched successfully"));
});

const createNews = asyncHandler(async (req, res) => {
    // Handle image uploads
    if (req.files && req.files.length > 0) {
        const imagePaths = req.files.map(file => {
            return `${req.protocol}://${req.get('host')}/images/${file.filename}`;
        });
        req.body.images = imagePaths;
    }

    const news = await News.create(req.body);

    if (!news) {
        throw new ApiError(500, "Something went wrong while creating news");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, news, "News created successfully"));
});

// @desc    Trigger AI analysis for a news item
// @route   GET /api/news/:id/analyze
// @access  Private
const analyzeNews = asyncHandler(async (req, res) => {
    const news = await News.findById(req.params.id);

    if (!news) {
        throw new ApiError(404, "News not found");
    }

    // TODO: Integrate with AI service
    // For now, just simulate the analysis
    news.aiSummary = 'AI Summary will be generated here...';
    news.factCheckStatus = 'Unverified';
    news.factCheckAnalysis = 'AI Fact Check will be generated here...';

    const updatedNews = await news.save();

    return res
        .status(200)
        .json(new ApiResponse(200, updatedNews, "News analyzed successfully"));
});

export { getAllNews, createNews, analyzeNews };