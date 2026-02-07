import express from 'express';
import Chat from '../models/Chat.js';

const router = express.Router();

// @route   GET /api/chat/:room
// @desc    Get chat history for a room
// @access  Public/Private
router.get('/:room', async (req, res) => {
    res.json({ message: 'Get chat history route' });
});

export default router;
