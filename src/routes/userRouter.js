import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/userController.js';
import { verifyJWT, verifyJWTForLogout } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

//secure Routes
router.post('/logout', verifyJWTForLogout, logoutUser);

export default router;
