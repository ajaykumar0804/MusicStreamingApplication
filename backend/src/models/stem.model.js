import mongoose from "mongoose";

const StemFileSchema = new mongoose.Schema({
    filename: String,
    path: String,
    createdAt: { type: Date, default: Date.now, expires: 3600 }, // Auto-delete after 1 hour
});

export default mongoose.model("StemFile", StemFileSchema);
