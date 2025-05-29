import { useState } from "react";
import { motion } from "framer-motion";
import { FaPlay, FaPause } from "react-icons/fa";

export interface SongCardProps {
  song: {
    _id: string;
    title: string;
    artist: string;
    imageUrl: string;
    audioUrl: string;
  };
  setPlayingSong: (songUrl: string | null) => void;
}

const SongCard = ({ song, setPlayingSong }: SongCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audio = new Audio(song.audioUrl);

  const togglePlay = () => {
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setPlayingSong(null);
    } else {
      audio.play();
      setIsPlaying(true);
      setPlayingSong(song.audioUrl);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-gray-800 p-4 rounded-lg flex items-center space-x-4 shadow-md"
    >
      {/* Song Image */}
      <img src={song.imageUrl} alt={song.title} className="w-16 h-16 rounded-md object-cover" />

      {/* Song Info */}
      <div className="flex-1">
        <h4 className="text-white font-medium">{song.title}</h4>
        <p className="text-gray-400 text-sm">{song.artist}</p>
      </div>

      {/* Play Button */}
      <button
        onClick={togglePlay}
        className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
        
      >
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>
    </motion.div>
  );
};

export default SongCard;
