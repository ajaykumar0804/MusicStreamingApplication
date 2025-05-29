import express from "express";
import { uploadAndSeparateStems, adjustStemVolumes} from "../controller/stemSeparationController.js";

const router = express.Router();

// 🎵 Upload & Separate Stems using Busboy
router.post("/separate", uploadAndSeparateStems);

// 🎚 Adjust Stem Volumes
router.post("/adjust", adjustStemVolumes);

export default router;
