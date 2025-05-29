import { Router } from "express";
import { getAllSongs, getFeaturedSongs, getMadeForYouSongs, getTrendingSongs } from "../controller/song.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protectRoute, getAllSongs);
router.get("/featured", getFeaturedSongs);
router.get("/made-for-you", getMadeForYouSongs);
router.get("/trending", getTrendingSongs);
router.post("/recommend", async (req, res) => {
    try {
        const { features } = req.body; // Get features from request
        const response = await axios.post("http://localhost:5001/recommend", { features });
        res.json(response.data); // Return AI recommendations
    } catch (error) {
        res.status(500).json({ error: "Error fetching recommendations" });
    }
});


export default router;
