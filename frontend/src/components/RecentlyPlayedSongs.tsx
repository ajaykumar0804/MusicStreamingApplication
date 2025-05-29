import { useEffect, useState } from "react";
import { getRecentlyPlayed } from "../utils/storage";
import SongPlayer from "./SongPlayer";

interface Song {
    id: string;
    snippet: {
        title?: string;
        thumbnails?: {
            medium?: { url?: string };
        };
    };
}

const RecentlyPlayedSongs = () => {
    const [recentSongs, setRecentSongs] = useState<Song[]>([]);

    useEffect(() => {
        const loadRecentlyPlayed = () => {
            const songs = getRecentlyPlayed();
            if (Array.isArray(songs)) {
                setRecentSongs(songs);
            }
        };
        loadRecentlyPlayed();
    }, []);

    return (
        <div>
            <h2 className="text-lg font-bold mb-2">Recently Played</h2>
            {recentSongs.length === 0 ? (
                <p className="text-gray-500">No recently played songs</p>
            ) : (
                <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {recentSongs.map((song, index) => (
                        <li key={index} className="p-2 border rounded-lg">
                            {song.snippet?.thumbnails?.medium?.url ? (
                                <img src={song.snippet.thumbnails.medium.url} alt={song.snippet.title || "No Title"} />
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
            )}
        </div>
    );
};

export default RecentlyPlayedSongs;
