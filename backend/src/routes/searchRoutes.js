import express from "express";
import { searchSongs } from "../controller/searchController.js";

const router = express.Router();

router.get("/", searchSongs);

export default router;
