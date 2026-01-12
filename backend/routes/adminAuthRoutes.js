import express from "express";
import {
    signupAdmin,
    loginAdmin,
    logoutAdmin,
    refreshAccessToken
} from "../controllers/adminAuthController.js"

import { isAdmin } from "../middlewares/isAdmin.js"

const router = express.Router();

router.post("/signup", signupAdmin);
router.post("/login", loginAdmin);
router.post("/logout", isAdmin, logoutAdmin);
router.post("/refresh-token", refreshAccessToken);

export default router;
