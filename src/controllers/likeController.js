import mongoose from "mongoose";
import { Like } from "../models/likeModel.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    // toggle like on video
    const alreadyLiked = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })

    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked?._id);

        return res.status(200).json(new ApiResponse(200, {isLiked: false}, "Unliked successfully"));

    }

    await Like.create({
        video: videoId,
        likedBy: req.user?._id
    })

    return res.status(200).json(new ApiResponse(200, {isLiked: true}, "Liked successfully"));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    // toggle like on comment
    const alreadyLiked = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    })

    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked?._id);

        return res.status(200).json(new ApiResponse(200, {isLiked: false}, "Unliked successfully"));

    }

    await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })

    return res.status(200).json(new ApiResponse(200, {isLiked: true}, "Liked successfully"));
})

const toggleNewsLike = asyncHandler(async (req, res) => {
    const { newsId } = req.params;
    // toggle like on news
    const alreadyLiked = await Like.findOne({
        news: newsId,
        likedBy: req.user?._id
    })

    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked?._id);

        return res.status(200).json(new ApiResponse(200, {isLiked: false}, "Unliked successfully"));

    }

    await Like.create({
        news: newsId,
        likedBy: req.user?._id
    })

    return res.status(200).json(new ApiResponse(200, {isLiked: true}, "Liked successfully"));

}
)

const togglePodcastLike = asyncHandler(async (req, res) => {
    const { podcastId } = req.params;
    // toggle like on podcast
    const alreadyLiked = await Like.findOne({
        podcast: podcastId,
        likedBy: req.user?._id
    })

    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked?._id);

        return res.status(200).json(new ApiResponse(200, {isLiked: false}, "Unliked successfully"));

    }

    await Like.create({
        podcast: podcastId,
        likedBy: req.user?._id
    })

    return res.status(200).json(new ApiResponse(200, {isLiked: true}, "Liked successfully"));


})

const getLikedVideos = asyncHandler(async (req, res) => {
    // get all liked videos by user
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $unwind: "$video"
        },
        {
            $project: {
                video: 1
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
})

export {
    toggleCommentLike,
    toggleNewsLike,
    toggleVideoLike,
    togglePodcastLike,
    getLikedVideos
}
