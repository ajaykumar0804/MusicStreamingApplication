import { useRecommend } from "../context/RecommendContext";
import { useEffect } from "react";

const Recommendations = ({ userId }: { userId: string }) => {
    const { recommendedSongs, getRecommendations, loading } = useRecommend();

    useEffect(() => {
        if (userId) {
            getRecommendations(userId);
        }
    }, [userId]);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">🎵 Personalized Recommendations</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul className="space-y-2">
                    {recommendedSongs.map((song: any, index: number) => (
                        <li key={index} className="p-2 bg-blue-100 dark:bg-blue-800 rounded-md">
                            {song.song}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Recommendations;
