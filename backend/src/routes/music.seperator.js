import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import { Song } from '../models/song.model.js'; // Import your Song model

const router = express.Router();

router.post('/separate-music', async (req, res) => {
  try {
    // Fetch the song from the database
    const songId = req.body.songId; // Assume the song ID is sent in the request body
    const song = await Song.findById(songId);

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    const audioFilePath = song.filePath; // Assuming the file path is stored in the 'filePath' field

    // Set the output directory based on the song ID or title
    const outputDir = path.join(__dirname, `../../output/${songId}`);

    // Construct the command to run the Python script
    const command = `python backend/src/Music Seperator/music.seperator.py ${audioFilePath} ${outputDir}`;

    // Execute the Python script
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error.message}`);
        return res.status(500).json({ message: 'Error processing audio file' });
      }
      if (stderr) {
        console.error(`Script stderr: ${stderr}`);
        return res.status(500).json({ message: 'Error processing audio file' });
      }
      console.log(`Script stdout: ${stdout}`);
      res.status(200).json({ message: 'Audio processed successfully', outputDir });
    });
  } catch (error) {
    console.error(`Error fetching song: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;