import { useEffect } from "react";
import { storeRecentlyPlayed } from "../utils/storage";

interface SongPlayerProps {
    videoId?: string; // Optional to prevent errors
}

const SongPlayer = ({ videoId }: SongPlayerProps) => {
    useEffect(() => {
        if (videoId) {
            storeRecentlyPlayed({ id: videoId, snippet: { title: "Song", thumbnails: { medium: { url: "" } } } });
        }
    }, [videoId]);

    if (!videoId) {
        return <p className="text-gray-500">No video available</p>;
    }

    return (
        <iframe
            width="100%"
            height="200"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
        ></iframe>
    );
};

export default SongPlayer;
