import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import fileUpload from "express-fileupload";
import path from "path";
import cors from "cors";
import fs from "fs";
import { createServer } from "http";

import { initializeSocket } from "./src/lib/socket.js";

import { connectDB } from "./src/lib/db.js";
import userRoutes from "./src/routes/user.route.js";
import adminRoutes from "./src/routes/admin.route.js";
import authRoutes from "./src/routes/auth.route.js";
import songRoutes from "./src/routes/song.route.js";
import albumRoutes from "./src/routes/album.route.js";
import statRoutes from "./src/routes/stats.route.js";
import stemSeparationRoutes from "./src/routes/stemSeparationRoutes.js";
import musicRoutes from './src/routes/song.route.js'
import youtubeRoutes from './src/routes/youtube.routes.js'
import searchRoutes from './src/routes/searchRoutes.js'
import { protectRoute, requireAdmin } from "./src/middleware/auth.middleware.js";
// import recommendRoutes from './src/routes/recommendRoutes.js'

dotenv.config();

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT;

const httpServer = createServer(app);
initializeSocket(httpServer);

app.use(
	cors({
		origin: "http://localhost:3000",
		credentials: true,
	})
);

// app.use(express.json()); // to parse req.body
app.use(clerkMiddleware()); // this will add auth to req obj => req.auth
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: path.join(__dirname, "tmp"),
		createParentPath: true,
		limits: {
			fileSize: 50 * 1024 * 1024, // 10MB  max file size
		},
	})
);
app.use(express.json({ limit: "100mb" }));
app.use(express.static("uploads"));

// cron jobs
// const tempDir = path.join(process.cwd(), "tmp");
// cron.schedule("0 * * * *", () => {
// 	if (fs.existsSync(tempDir)) {
// 		fs.readdir(tempDir, (err, files) => {
// 			if (err) {
// 				console.log("error", err);
// 				return;
// 			}
// 			for (const file of files) {
// 				fs.unlink(path.join(tempDir, file), (err) => {});
// 			}
// 		});
// 	}
// });

app.use("/api/users", userRoutes);
app.use("/api/admin",protectRoute,requireAdmin, adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);
app.use("/api/stems", stemSeparationRoutes);
app.use("/api/music", musicRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/search", searchRoutes);
// app.use("/api/recommend", recommendRoutes);

// if (process.env.NODE_ENV === "production") {
// 	app.use(express.static(path.join(__dirname, "../frontend/dist")));
// 	app.get("*", (req, res) => {
// 		res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
// 	});
// }

// error handler
// app.use((err, req, res, next) => {
// 	res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
// });

httpServer.listen(process.env.PORT, () => {
	console.log("Server is running on port " + PORT);
	connectDB();
});
