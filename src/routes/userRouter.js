import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/userController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

//secure Routes
router.post('/logout', verifyJWT, logoutUser);

export default router;
