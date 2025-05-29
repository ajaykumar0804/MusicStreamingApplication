import { useRecommend } from "../context/RecommendContext";

const PopularSongs = () => {
    const { popularSongs } = useRecommend();

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">🔥 Popular Songs</h2>
            <ul className="space-y-2">
                {popularSongs.map((song: any, index: number) => (
                    <li key={index} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                        {song.song}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PopularSongs;
