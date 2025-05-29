import {Song} from '../models/song.model.js'

export const getCurrentPlayingSong = async () => {
    try {
      const song = await Song.findOne({ isPlaying: true });
      console.log("Queried Song:", song); // Debug log
  
      if (!song) {
        console.error("No song currently playing in DB!");
        return null;
      }
  
      if (!song.filePath) {
        console.error("Song found, but filePath is missing!");
        return null;
      }
  
      return {
        title: song.title,
        artist: song.artist,
        filePath: song.filePath,
      };
    } catch (error) {
      console.error("Error fetching current playing song:", error);
      return null;
    }
  };
  