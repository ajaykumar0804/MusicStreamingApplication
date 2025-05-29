import { useEffect, useState } from "react";
import { fetchDefaultSongs } from "../services/youtubeService";
import SongPlayer from "./SongPlayer";

interface Song {
    id: string;
    snippet: {
        title: string;
        thumbnails: {
            medium: { url: string };
        };
    };
}

const DefaultSongs = () => {
    const [songs, setSongs] = useState<Song[]>([]);

    useEffect(() => {
        const loadSongs = async () => {
            try {
                const data = await fetchDefaultSongs();
                if (Array.isArray(data)) {
                    setSongs(data);
                } else {
                    console.error("Invalid API response:", data);
                }
            } catch (error) {
                console.error("Error loading songs:", error);
            }
        };
        loadSongs();
    }, []);

    return (
        <div>
            <h2 className="text-lg font-bold">Trending Songs</h2>
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {songs.map((song) => (
                    <li key={song.id} className="p-2 border rounded-lg">
                        {song.snippet?.thumbnails?.medium?.url ? (
                            <img src={song.snippet.thumbnails.medium.url} alt={song.snippet.title} />
                        ) : (
                            <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                                No Image
                            </div>
                        )}
                        <p>{song.snippet?.title || "Unknown Title"}</p>
                        <SongPlayer videoId={song.id} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DefaultSongs;
