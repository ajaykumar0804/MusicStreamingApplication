import { Router } from "express";
import { fetchDefaultSongs, fetchRecommendedSongs } from "../controller/youtube.controller.js";

const router = Router();

// Route: Fetch trending songs
router.get("/default", fetchDefaultSongs);

// Route: Fetch recommended songs based on search
router.get("/recommend", fetchRecommendedSongs);

export default router;
