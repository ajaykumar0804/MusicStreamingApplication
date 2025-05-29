import { useState, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { Song } from "@/types";

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [results, setResults] = useState<Song[]>([]);

  const { songs, fetchSongs } = useMusicStore();
  const setCurrentSong = usePlayerStore((state) => state.setCurrentSong);
  const initializeQueue = usePlayerStore((state) => state.initializeQueue);

  useEffect(() => {
    if (songs.length === 0) {
      fetchSongs();
    }
  }, []);

  const handleSearch = () => {
    if (query.trim() === "") return;

    const filtered = songs.filter((song) =>
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase())
    );

    setResults(filtered);
    setShowDialog(true);
  };

  const handleClear = () => {
    setQuery("");
    setShowDialog(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="relative w-[300px] max-w-md">
      <div className="flex items-center bg-white dark:bg-gray-900 rounded-md shadow px-3 py-2">
        <FaSearch className="text-white mr-2 cursor-pointer" onClick={handleSearch} />
        <input
          type="text"
          placeholder="Search songs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow bg-transparent outline-none text-sm text-gray-900 dark:text-white"
        />
        {query && (
          <FaTimes
            className="text-white ml-2 cursor-pointer"
            onClick={handleClear}
          />
        )}
      </div>

      {showDialog && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg max-h-64 overflow-y-auto custom-scrollbar">
          {results.map((song) => (
            <div
              key={song._id}
              onClick={() => {
                initializeQueue([song]);
                setCurrentSong(song);
                setShowDialog(false);
              }}
              className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              <img src={song.imageUrl} alt={song.title} className="w-10 h-10 rounded mr-3" />
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {song.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-300">
                  {song.artist}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
