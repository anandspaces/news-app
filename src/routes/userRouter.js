import express from 'express';
import { registerUser, loginUser, logoutUser, getInterests, getLanguages, getCurrentUser, updateAccountDetails, sendOTP, verifyOTP, resetPassword } from '../controllers/userController.js';
import { verifyJWT, verifyJWTForLogout } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/interests').get(getInterests);
router.route('/languages').get(getLanguages);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

//secure Routes
router.post('/logout', verifyJWTForLogout, logoutUser);
router.route('/current-user').get(verifyJWT, getCurrentUser);
router.route('/update-account').patch(verifyJWT, updateAccountDetails);

export default router;
