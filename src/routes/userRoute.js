import express from "express";
import {
  createUser,
  verifyEmail,
  loginUser,
  generateSpotifyRefreshToken,
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";
import { checkToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", createUser);
router.get("/verifyEmail/:verify_token", verifyEmail);
router.post("/login", loginUser);
router.get("/refreshToken", checkToken, generateSpotifyRefreshToken);
router.get("/profile", checkToken, getUserProfile);
router.post("/profile", checkToken, updateUserProfile);

export default router;
