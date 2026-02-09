import express from 'express';
import { registerUser, loginUser, logoutUser, getInterests } from '../controllers/userController.js';
import { verifyJWT, verifyJWTForLogout } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/interests').get(getInterests);

//secure Routes
router.post('/logout', verifyJWTForLogout, logoutUser);

export default router;
