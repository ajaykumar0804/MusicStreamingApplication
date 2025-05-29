import { createContext, useContext, useState, useEffect } from "react";
import { fetchPopularSongs, fetchPersonalizedRecommendations } from "../services/recommendService";

const RecommendContext = createContext<any>(null);

export const RecommendProvider = ({ children }: { children: React.ReactNode }) => {
    const [popularSongs, setPopularSongs] = useState([]);
    const [recommendedSongs, setRecommendedSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPopularSongs = async () => {
            try {
                const data = await fetchPopularSongs();
                setPopularSongs(data);
            } catch (error) {
                console.error(error);
            }
        };
        loadPopularSongs();
    }, []);

    const getRecommendations = async (userId: string) => {
        try {
            setLoading(true);
            const data = await fetchPersonalizedRecommendations(userId);
            setRecommendedSongs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <RecommendContext.Provider value={{ popularSongs, recommendedSongs, getRecommendations, loading }}>
            {children}
        </RecommendContext.Provider>
    );
};

export const useRecommend = () => useContext(RecommendContext);
