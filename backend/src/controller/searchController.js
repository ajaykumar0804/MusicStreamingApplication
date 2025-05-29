import {Song} from "../models/song.model.js";

export const searchSongs = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const songs = await Song.find({
      $or: [
        { title: { $regex: query, $options: "i" } },  // Case-insensitive search
        { artist: { $regex: query, $options: "i" } },
        { genre: { $regex: query, $options: "i" } },
        { album: { $regex: query, $options: "i" } },
      ],
    });

    res.status(200).json(songs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching songs", error });
  }
};
